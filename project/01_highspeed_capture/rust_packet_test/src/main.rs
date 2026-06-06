use std::io;
use std::time::Instant;

fn main() {
    let ifindex = unsafe { libc::if_nametoindex(b"veth_cap0\0".as_ptr() as *const i8) };
    println!("veth_cap0 ifindex = {}", ifindex);

    println!("\n=== Test 1: SOCK_NONBLOCK + MSG_DONTWAIT ===");
    let fd = unsafe {
        libc::socket(
            libc::AF_PACKET,
            libc::SOCK_RAW | libc::SOCK_NONBLOCK,
            (libc::ETH_P_ALL as u16).to_be() as i32,
        )
    };
    if fd < 0 {
        println!("socket failed: {}", io::Error::last_os_error());
        return;
    }

    let mut sll: libc::sockaddr_ll = unsafe { std::mem::zeroed() };
    sll.sll_family = libc::AF_PACKET as u16;
    sll.sll_protocol = (libc::ETH_P_ALL as u16).to_be();
    sll.sll_ifindex = ifindex as i32;

    let ret = unsafe {
        libc::bind(
            fd,
            &sll as *const _ as *const libc::sockaddr,
            std::mem::size_of::<libc::sockaddr_ll>() as libc::socklen_t,
        )
    };
    if ret < 0 {
        println!("bind failed: {}", io::Error::last_os_error());
        unsafe { libc::close(fd); }
        return;
    }
    println!("bind succeeded");

    let mut buf = [0u8; 65536];
    let mut count = 0u64;
    let start = Instant::now();
    let mut eagain_count = 0u64;

    while start.elapsed().as_secs() < 5 {
        match unsafe {
            libc::recvfrom(
                fd,
                buf.as_mut_ptr() as *mut libc::c_void,
                buf.len(),
                libc::MSG_DONTWAIT,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
            )
        } {
            n if n > 0 => {
                count += 1;
                if count <= 3 {
                    println!("  received packet #{}: {} bytes", count, n);
                }
            }
            _ => {
                eagain_count += 1;
                if eagain_count % 1000000 == 0 {
                    print!(".");
                    std::io::Write::flush(&mut std::io::stdout()).ok();
                }
            }
        }
    }
    unsafe { libc::close(fd); }
    println!("\nNon-blocking: received {} packets in 5s (eagain: {})", count, eagain_count);

    println!("\n=== Test 2: Blocking socket + SO_RCVTIMEO ===");
    let fd2 = unsafe {
        libc::socket(
            libc::AF_PACKET,
            libc::SOCK_RAW,
            (libc::ETH_P_ALL as u16).to_be() as i32,
        )
    };
    if fd2 < 0 {
        println!("socket failed: {}", io::Error::last_os_error());
        return;
    }

    let timeout = libc::timeval {
        tv_sec: 1,
        tv_usec: 0,
    };
    unsafe {
        libc::setsockopt(
            fd2,
            libc::SOL_SOCKET,
            libc::SO_RCVTIMEO,
            &timeout as *const _ as *const libc::c_void,
            std::mem::size_of::<libc::timeval>() as libc::socklen_t,
        );
    }

    let ret2 = unsafe {
        libc::bind(
            fd2,
            &sll as *const _ as *const libc::sockaddr,
            std::mem::size_of::<libc::sockaddr_ll>() as libc::socklen_t,
        )
    };
    if ret2 < 0 {
        println!("bind failed: {}", io::Error::last_os_error());
        unsafe { libc::close(fd2); }
        return;
    }
    println!("bind succeeded");

    let mut buf2 = [0u8; 65536];
    let mut count2 = 0u64;
    let start2 = Instant::now();
    let mut timeout_count = 0u64;

    while start2.elapsed().as_secs() < 5 {
        match unsafe {
            libc::recvfrom(
                fd2,
                buf2.as_mut_ptr() as *mut libc::c_void,
                buf2.len(),
                0,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
            )
        } {
            n if n > 0 => {
                count2 += 1;
                if count2 <= 3 {
                    println!("  received packet #{}: {} bytes", count2, n);
                }
            }
            n if n < 0 => {
                let err = io::Error::last_os_error();
                if err.kind() == io::ErrorKind::WouldBlock
                    || err.raw_os_error() == Some(libc::EAGAIN)
                {
                    timeout_count += 1;
                } else {
                    println!("  recvfrom error: {}", err);
                }
            }
            _ => {}
        }
    }
    unsafe { libc::close(fd2); }
    println!(
        "Blocking: received {} packets in 5s (timeouts: {})",
        count2, timeout_count
    );

    println!("\n=== Test 3: SOCK_NONBLOCK + sleep on EAGAIN ===");
    let fd3 = unsafe {
        libc::socket(
            libc::AF_PACKET,
            libc::SOCK_RAW | libc::SOCK_NONBLOCK,
            (libc::ETH_P_ALL as u16).to_be() as i32,
        )
    };
    if fd3 < 0 {
        println!("socket failed: {}", io::Error::last_os_error());
        return;
    }

    let ret3 = unsafe {
        libc::bind(
            fd3,
            &sll as *const _ as *const libc::sockaddr,
            std::mem::size_of::<libc::sockaddr_ll>() as libc::socklen_t,
        )
    };
    if ret3 < 0 {
        println!("bind failed: {}", io::Error::last_os_error());
        unsafe { libc::close(fd3); }
        return;
    }

    let mut buf3 = [0u8; 65536];
    let mut count3 = 0u64;
    let start3 = Instant::now();

    while start3.elapsed().as_secs() < 5 {
        match unsafe {
            libc::recvfrom(
                fd3,
                buf3.as_mut_ptr() as *mut libc::c_void,
                buf3.len(),
                libc::MSG_DONTWAIT,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
            )
        } {
            n if n > 0 => {
                count3 += 1;
                if count3 <= 3 {
                    println!("  received packet #{}: {} bytes", count3, n);
                }
            }
            _ => {
                std::thread::sleep(std::time::Duration::from_micros(100));
            }
        }
    }
    unsafe { libc::close(fd3); }
    println!("Non-blocking + sleep: received {} packets in 5s", count3);

    println!("\n=== Summary ===");
    println!("Test 1 (NONBLOCK+DONTWAIT): {} packets", count);
    println!("Test 2 (BLOCKING+RCVTIMEO): {} packets", count2);
    println!("Test 3 (NONBLOCK+SLEEP):    {} packets", count3);
}
