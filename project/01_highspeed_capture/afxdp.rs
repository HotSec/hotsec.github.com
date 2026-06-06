use std::io::{self, Read};
use std::os::fd::{FromRawFd, RawFd};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use log::{info, warn};
use memmap2::{MmapMut, MmapOptions};
use crate::config::Settings;
use crate::storage::PacketData;

const AF_XDP_ADDR: i32 = 44;
const SOL_XDP: i32 = 284;
const XDP_UMEM_REG: i32 = 1;
const XDP_UMEM_FILL_RING: i32 = 2;
const XDP_UMEM_COMPLETION_RING: i32 = 3;
const XDP_OPTIONS: i32 = 5;
const XDP_USE_NEED_WAKEUP: u32 = 8;
const XDP_COPY: u16 = 1 << 1;

const XDP_PGOFF_RX_RING: u64 = 0;
const XDP_UMEM_PGOFF_FILL_RING: u64 = 0x0100_0000_0000;
const XDP_UMEM_PGOFF_COMPLETION_RING: u64 = 0x0180_0000_0000;

#[repr(C)]
struct xdp_umem_reg {
    addr: u64,
    len: u64,
    chunk_size: u32,
    headroom: u32,
    flags: u32,
}

#[repr(C)]
struct xdp_desc {
    addr: u64,
    len: u32,
    options: u32,
}

#[repr(C)]
struct xdp_ring_offset {
    producer: u64,
    consumer: u64,
    desc: u64,
    flags: u64,
}

#[repr(C)]
struct xdp_mmap_offsets {
    rx: xdp_ring_offset,
    tx: xdp_ring_offset,
    fr: xdp_ring_offset,
    cr: xdp_ring_offset,
}

#[repr(C)]
struct sockaddr_xdp {
    sxdp_family: u16,
    sxdp_flags: u16,
    sxdp_ifindex: u32,
    sxdp_queue_id: u32,
    sxdp_shared_umem_fd: u32,
}

struct Ring {
    _mmap: MmapMut,
    producer: *mut u32,
    consumer: *mut u32,
    desc: *mut xdp_desc,
    flags: *mut u32,
    mask: u32,
}

impl Ring {
    unsafe fn new(
        mmap: MmapMut,
        off_producer: u64,
        off_consumer: u64,
        off_desc: u64,
        off_flags: u64,
    ) -> Self {
        let base = mmap.as_ptr() as usize;
        let producer = (base + off_producer as usize) as *mut u32;
        let consumer = (base + off_consumer as usize) as *mut u32;
        let desc = (base + off_desc as usize) as *mut xdp_desc;
        let flags = (base + off_flags as usize) as *mut u32;

        let total_desc_bytes = off_desc as usize - off_producer as usize;
        let desc_count = total_desc_bytes / std::mem::size_of::<xdp_desc>();
        let mask = desc_count as u32 - 1;

        Ring { _mmap: mmap, producer, consumer, desc, flags, mask }
    }

    fn fill_desc(&mut self, descs: &[(u64, u32)]) -> u32 {
        let prod = unsafe { std::ptr::read_volatile(self.producer) };
        let cons = unsafe { std::ptr::read_volatile(self.consumer) };
        let free_entries = self.mask.wrapping_sub(prod.wrapping_sub(cons) & self.mask);
        let to_enqueue = (descs.len() as u32).min(free_entries);

        let mut idx = prod & self.mask;
        for i in 0..(to_enqueue as usize) {
            if idx > self.mask { idx = 0; }
            unsafe {
                let dp = self.desc.offset(idx as isize);
                (*dp).addr = descs[i].0;
                (*dp).len = descs[i].1;
            }
            idx = idx.wrapping_add(1);
        }

        unsafe { std::ptr::write_volatile(self.producer, prod.wrapping_add(to_enqueue)); }
        to_enqueue
    }

    fn dequeue(&mut self) -> Vec<(u64, u32)> {
        let cons = unsafe { std::ptr::read_volatile(self.consumer) };
        let prod = unsafe { std::ptr::read_volatile(self.producer) };

        let available = prod.wrapping_sub(cons) & self.mask;
        let to_dequeue = available.min(64);

        let mut result = Vec::with_capacity(to_dequeue as usize);
        let mut idx = cons & self.mask;
        for _ in 0..to_dequeue {
            if idx > self.mask { idx = 0; }
            unsafe {
                let dp = self.desc.offset(idx as isize);
                result.push(((*dp).addr, (*dp).len));
            }
            idx = idx.wrapping_add(1);
        }

        unsafe { std::ptr::write_volatile(self.consumer, cons.wrapping_add(to_dequeue)); }
        result
    }

    fn poll(&self) -> bool {
        let prod = unsafe { std::ptr::read_volatile(self.producer) };
        let cons = unsafe { std::ptr::read_volatile(self.consumer) };
        prod != cons
    }
}

pub struct XskSocket {
    _socket_fd: std::fs::File,
    _xsk_fd: RawFd,
    _umem: MmapMut,
    umem_frame_count: u32,
    umem_frame_size: u32,
    rx_ring: Ring,
    fill_ring: Ring,
    _completion_ring: Ring,
}

impl XskSocket {
    pub fn create(
        if_index: i32,
        queue_id: u32,
        umem_frame_count: u32,
        umem_frame_size: u32,
        fill_ring_size: u32,
        rx_ring_size: u32,
        use_huge_pages: bool,
    ) -> io::Result<Self> {
        let total_umem_size = (umem_frame_count as usize) * (umem_frame_size as usize);
        let umem = Self::allocate_umem(total_umem_size, use_huge_pages)?;
        let umem_ptr = umem.as_ptr() as u64;
        let umem_len = umem.len() as u64;

        let xsk_fd = unsafe {
            libc::socket(AF_XDP_ADDR, libc::SOCK_RAW | libc::SOCK_NONBLOCK, 0)
        };
        if xsk_fd < 0 {
            return Err(io::Error::last_os_error());
        }

        unsafe {
            let reg = xdp_umem_reg {
                addr: umem_ptr,
                len: umem_len,
                chunk_size: umem_frame_size,
                headroom: 0,
                flags: 0,
            };
            let ret = libc::setsockopt(
                xsk_fd, SOL_XDP, XDP_UMEM_REG,
                &reg as *const _ as *const libc::c_void,
                std::mem::size_of::<xdp_umem_reg>() as libc::socklen_t,
            );
            if ret != 0 {
                let _ = libc::close(xsk_fd);
                return Err(io::Error::last_os_error());
            }
        }

        let mut offsets: xdp_mmap_offsets = unsafe { std::mem::zeroed() };
        let mut optlen = std::mem::size_of::<xdp_mmap_offsets>() as libc::socklen_t;
        unsafe {
            let ret = libc::getsockopt(
                xsk_fd, SOL_XDP, XDP_UMEM_REG,
                &mut offsets as *mut _ as *mut libc::c_void,
                &mut optlen,
            );
            if ret != 0 {
                let _ = libc::close(xsk_fd);
                return Err(io::Error::last_os_error());
            }
        }

        let fill_ring_desc_count = fill_ring_size.next_power_of_two();
        let comp_ring_desc_count = fill_ring_size.next_power_of_two();

        let fr = &offsets.fr;
        let fill_ring_size_bytes = (fill_ring_desc_count as u64) * std::mem::size_of::<xdp_desc>() as u64
            + fr.desc - fr.producer;

        let cr = &offsets.cr;
        let comp_ring_size_bytes = (comp_ring_desc_count as u64) * std::mem::size_of::<xdp_desc>() as u64
            + cr.desc - cr.producer;

        unsafe {
            let ret = libc::setsockopt(
                xsk_fd, SOL_XDP, XDP_UMEM_FILL_RING,
                &fill_ring_desc_count as *const _ as *const libc::c_void,
                std::mem::size_of::<u32>() as libc::socklen_t,
            );
            if ret != 0 { let _ = libc::close(xsk_fd); return Err(io::Error::last_os_error()); }

            let ret = libc::setsockopt(
                xsk_fd, SOL_XDP, XDP_UMEM_COMPLETION_RING,
                &comp_ring_desc_count as *const _ as *const libc::c_void,
                std::mem::size_of::<u32>() as libc::socklen_t,
            );
            if ret != 0 { let _ = libc::close(xsk_fd); return Err(io::Error::last_os_error()); }
        }

        let fill_mmap = Self::mmap_ring_fd(xsk_fd, XDP_UMEM_PGOFF_FILL_RING, fill_ring_size_bytes as usize)?;
        let comp_mmap = Self::mmap_ring_fd(xsk_fd, XDP_UMEM_PGOFF_COMPLETION_RING, comp_ring_size_bytes as usize)?;

        let mut fill_ring = unsafe {
            Ring::new(fill_mmap, fr.producer, fr.consumer, fr.desc, fr.flags)
        };
        let comp_ring = unsafe {
            Ring::new(comp_mmap, cr.producer, cr.consumer, cr.desc, cr.flags)
        };

        for i in 0..umem_frame_count {
            let addr = i as u64 * umem_frame_size as u64;
            fill_ring.fill_desc(&[(addr, umem_frame_size)]);
        }

        unsafe {
            let opt = XDP_USE_NEED_WAKEUP;
            let ret = libc::setsockopt(
                xsk_fd, SOL_XDP, XDP_OPTIONS,
                &opt as *const _ as *const libc::c_void,
                std::mem::size_of::<u32>() as libc::socklen_t,
            );
            if ret != 0 { let _ = libc::close(xsk_fd); return Err(io::Error::last_os_error()); }
        }

        let rx_ring_desc_count = rx_ring_size.next_power_of_two();
        let off_rx = &offsets.rx;
        let rx_ring_size_bytes = (rx_ring_desc_count as u64) * std::mem::size_of::<xdp_desc>() as u64
            + off_rx.desc - off_rx.producer;

        let rx_mmap = Self::mmap_ring_fd(xsk_fd, XDP_PGOFF_RX_RING, rx_ring_size_bytes as usize)?;
        let rx_ring = unsafe {
            Ring::new(rx_mmap, off_rx.producer, off_rx.consumer, off_rx.desc, off_rx.flags)
        };

        let mut sxdp: sockaddr_xdp = unsafe { std::mem::zeroed() };
        sxdp.sxdp_family = AF_XDP_ADDR as u16;
        sxdp.sxdp_flags = XDP_COPY;
        sxdp.sxdp_ifindex = if_index as u32;
        sxdp.sxdp_queue_id = queue_id;

        unsafe {
            let ret = libc::bind(
                xsk_fd,
                &sxdp as *const _ as *const libc::sockaddr,
                std::mem::size_of::<sockaddr_xdp>() as libc::socklen_t,
            );
            if ret != 0 {
                let err = io::Error::last_os_error();
                let _ = libc::close(xsk_fd);
                return Err(err);
            }
        }

        let dup_fd = unsafe { libc::dup(xsk_fd) };
        let socket_file = unsafe { std::fs::File::from_raw_fd(dup_fd) };

        info!("AF_XDP socket created: if_index={}, queue={}, umem_frames={}",
              if_index, queue_id, umem_frame_count);

        Ok(XskSocket {
            _socket_fd: socket_file,
            _xsk_fd: xsk_fd,
            _umem: umem,
            umem_frame_count,
            umem_frame_size,
            rx_ring,
            fill_ring,
            _completion_ring: comp_ring,
        })
    }

    fn allocate_umem(size: usize, use_huge_pages: bool) -> io::Result<MmapMut> {
        if use_huge_pages {
            let path = "/dev/hugepages/capture_umem";
            let file = std::fs::OpenOptions::new()
                .read(true).write(true).create(true).truncate(true)
                .open(path)
                .or_else(|_| {
                    let tmp = "/tmp/capture_umem";
                    std::fs::OpenOptions::new()
                        .read(true).write(true).create(true).truncate(true)
                        .open(tmp)
                })?;
            file.set_len(size as u64)?;
            unsafe { MmapMut::map_mut(&file) }
        } else {
            let file = tempfile::tempfile()?;
            file.set_len(size as u64)?;
            unsafe { MmapMut::map_mut(&file) }
        }
    }

    fn mmap_ring_fd(fd: RawFd, offset: u64, size: usize) -> io::Result<MmapMut> {
        let dup_fd = unsafe { libc::dup(fd) };
        if dup_fd < 0 {
            return Err(io::Error::last_os_error());
        }
        let file = unsafe { std::fs::File::from_raw_fd(dup_fd) };
        unsafe {
            MmapOptions::new()
                .offset(offset)
                .len(size)
                .map_mut(&file)
        }
    }

    pub fn poll_and_receive(&mut self, packets: &mut Vec<PacketData>) -> io::Result<usize> {
        if !self.rx_ring.poll() {
            return Ok(0);
        }

        let descs = self.rx_ring.dequeue();
        let count = descs.len();

        if count == 0 {
            return Ok(0);
        }

        let umem_slice = &self._umem;
        let umem_len = umem_slice.len();

        let mut refill = Vec::with_capacity(count);

        for (addr, len) in &descs {
            let offset = (*addr as usize) % umem_len;
            let pkt_len = (*len as usize).min(self.umem_frame_size as usize).min(9000);

            let mut data = vec![0u8; pkt_len];
            data.copy_from_slice(&umem_slice[offset..offset + pkt_len]);

            packets.push(PacketData {
                data,
                timestamp: chrono::Utc::now(),
            });

            refill.push((*addr, self.umem_frame_size));
        }

        self.fill_ring.fill_desc(&refill);

        Ok(count)
    }
}

pub struct PacketCapture {
    settings: Settings,
    if_index: i32,
    sender: crossbeam::channel::Sender<PacketData>,
    running: Arc<AtomicBool>,
}

impl PacketCapture {
    pub fn new(
        settings: &Settings,
        sender: crossbeam::channel::Sender<PacketData>,
    ) -> anyhow::Result<Self> {
        let if_index = Self::get_interface_index(&settings.interface)?;
        info!("AF_XDP capture on interface {} (index: {})", settings.interface, if_index);
        Ok(Self { settings: settings.clone(), if_index, sender, running: Arc::new(AtomicBool::new(true)) })
    }

    fn get_interface_index(name: &str) -> anyhow::Result<i32> {
        nix::net::if_::if_nametoindex(name).map(|i| i as i32).map_err(Into::into)
    }

    pub async fn run(&self) -> anyhow::Result<()> {
        info!("Starting AF_XDP capture loop");

        #[cfg(target_os = "linux")]
        {
            use nix::sched::{sched_setaffinity, CpuSet};
            if !self.settings.performance.cpu_core_affinity.is_empty() {
                let mut cpuset = CpuSet::new();
                for &core in &self.settings.performance.cpu_core_affinity {
                    if let Err(e) = cpuset.set(core) {
                        warn!("CPU affinity for core {} failed: {}", core, e);
                    }
                }
                match sched_setaffinity(nix::unistd::Pid::from_raw(0), &cpuset) {
                    Ok(_) => info!("CPU affinity set to: {:?}", self.settings.performance.cpu_core_affinity),
                    Err(e) => warn!("Failed to set CPU affinity: {}", e),
                }
            }
        }

        let afxdp = self.settings.afxdp.clone();
        let queue_count = self.get_queue_count();

        let mut sockets: Vec<XskSocket> = Vec::new();
        for q in 0..queue_count.min(8) {
            match XskSocket::create(
                self.if_index, q,
                (afxdp.umem_size / afxdp.frame_size / 8).max(1024) as u32,
                afxdp.frame_size as u32,
                afxdp.fill_ring_size as u32,
                afxdp.rx_ring_size as u32,
                afxdp.use_huge_pages,
            ) {
                Ok(xsk) => { info!("AF_XDP socket for queue {}", q); sockets.push(xsk); }
                Err(e) => { warn!("AF_XDP queue {} failed: {}", q, e); }
            }
        }

        if sockets.is_empty() {
            warn!("No AF_XDP sockets created, using tcpdump fallback");
            return self.run_tcpdump_fallback().await;
        }

        info!("AF_XDP capture active with {} queues", sockets.len());

        let mut packet_count = 0u64;
        let mut byte_count = 0u64;
        let mut last_report = std::time::Instant::now();
        let mut batch = Vec::with_capacity(256);

        loop {
            if !self.running.load(Ordering::Relaxed) {
                break;
            }

            let mut received = false;
            for sock in &mut sockets {
                batch.clear();
                match sock.poll_and_receive(&mut batch) {
                    Ok(n) if n > 0 => {
                        received = true;
                        packet_count += n as u64;
                        for pkt in batch.drain(..) {
                            byte_count += pkt.data.len() as u64;
                            let _ = self.sender.try_send(pkt);
                        }
                    }
                    Ok(_) => {}
                    Err(e) => warn!("AF_XDP recv error: {}", e),
                }
            }

            if !received {
                std::thread::yield_now();
            }

            let elapsed = last_report.elapsed();
            if elapsed >= std::time::Duration::from_secs(1) {
                let secs = elapsed.as_secs().max(1);
                let pps = packet_count / secs;
                let mbps = (byte_count * 8) as f64 / secs as f64 / 1_000_000.0;
                info!("AF_XDP: {} pps, {:.1} Mbps, {} queues", pps, mbps, sockets.len());
                packet_count = 0;
                byte_count = 0;
                last_report = std::time::Instant::now();
            }
        }

        info!("AF_XDP capture stopped");
        Ok(())
    }

    fn get_queue_count(&self) -> u32 {
        let path = format!("/sys/class/net/{}/queues/", self.settings.interface);
        std::fs::read_dir(&path)
            .map(|d| d.filter(|e| {
                e.as_ref().map(|en| {
                    let n = en.file_name();
                    n.to_string_lossy().starts_with("rx-")
                }).unwrap_or(false)
            }).count() as u32)
            .unwrap_or(1)
            .max(1)
    }

    async fn run_tcpdump_fallback(&self) -> anyhow::Result<()> {
        info!("Using tcpdump fallback");
        let mut child = std::process::Command::new("tcpdump")
            .args(["-i", &self.settings.interface, "-n", "-l", "-w", "-"])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::null())
            .spawn()?;

        let mut stdout = child.stdout.take().unwrap();
        let mut buf = [0u8; 65536];
        let mut count = 0u64;
        let mut last = std::time::Instant::now();

        loop {
            if !self.running.load(Ordering::Relaxed) {
                let _ = child.kill();
                break;
            }
            match stdout.read(&mut buf) {
                Ok(0) => break,
                Ok(_) => {
                    count += 1;
                    if last.elapsed() >= std::time::Duration::from_secs(1) {
                        info!("tcpdump: {} blocks/sec", count);
                        count = 0;
                        last = std::time::Instant::now();
                    }
                }
                Err(e) => { warn!("tcpdump: {}", e); break; }
            }
        }
        Ok(())
    }
}

impl Drop for PacketCapture {
    fn drop(&mut self) {
        self.running.store(false, Ordering::Relaxed);
        info!("AF_XDP cleanup complete");
    }
}