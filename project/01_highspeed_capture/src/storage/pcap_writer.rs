use std::fs::{File, OpenOptions};
use std::io;
use std::path::PathBuf;
use chrono::{DateTime, Utc};
use memmap2::MmapMut;

pub struct PcapWriter {
    output_dir: PathBuf,
    size_limit: u64,
    current_file: Option<File>,
    current_mmap: Option<MmapMut>,
    current_size: u64,
    file_count: u64,
}

impl PcapWriter {
    pub fn new(output_dir: PathBuf, size_limit_mb: usize) -> io::Result<Self> {
        std::fs::create_dir_all(&output_dir)?;

        let mut writer = Self {
            output_dir,
            size_limit: (size_limit_mb as u64) * 1024 * 1024,
            current_file: None,
            current_mmap: None,
            current_size: 0,
            file_count: 0,
        };

        writer.create_new_file()?;
        Ok(writer)
    }

    fn create_new_file(&mut self) -> io::Result<()> {
        self.flush_current()?;

        let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let filename = self.output_dir.join(format!("capture_{}_{}.pcapng", timestamp, self.file_count));
        self.file_count += 1;

        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(true)
            .open(&filename)?;

        file.set_len(self.size_limit)?;

        let mmap = unsafe { MmapMut::map_mut(&file)? };

        self.current_file = Some(file);
        self.current_mmap = Some(mmap);
        self.current_size = 0;

        self.write_pcapng_header()?;

        Ok(())
    }

    fn write_pcapng_header(&mut self) -> io::Result<()> {
        let header = [
            0x0a, 0x0d, 0x0d, 0x0a,
            0x1c, 0x00, 0x00, 0x00,
            0x4d, 0x3c, 0x2b, 0x1a,
            0x01, 0x00,
            0x00, 0x00,
            0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff,
            0x1c, 0x00, 0x00, 0x00,
        ];

        self.write_raw(&header)
    }

    pub fn write_packet(&mut self, data: &[u8], timestamp: DateTime<Utc>) -> io::Result<()> {
        let padding = (4 - (data.len() % 4)) % 4;
        let block_len = (data.len() + 28 + padding) as u32;

        if self.current_size + (block_len as u64) > self.size_limit {
            self.create_new_file()?;
        }

        let mmap = self.current_mmap.as_mut().ok_or_else(|| {
            io::Error::new(io::ErrorKind::Other, "no mmap buffer")
        })?;
        let pos = self.current_size as usize;
        if pos + (block_len as usize) > mmap.len() {
            return Err(io::Error::new(io::ErrorKind::OutOfMemory, "mmap buffer full"));
        }

        let ts_nanos = timestamp.timestamp_nanos_opt().unwrap_or_default();
        let ts_high = ((ts_nanos >> 32) & 0xffffffff) as u32;
        let ts_low = (ts_nanos & 0xffffffff) as u32;

        let mut off = pos;
        mmap[off..off + 4].copy_from_slice(&[0x06, 0x00, 0x00, 0x00]);
        off += 4;
        mmap[off..off + 4].copy_from_slice(&block_len.to_le_bytes());
        off += 4;
        mmap[off..off + 4].copy_from_slice(&0u32.to_le_bytes());
        off += 4;
        mmap[off..off + 4].copy_from_slice(&ts_high.to_le_bytes());
        off += 4;
        mmap[off..off + 4].copy_from_slice(&ts_low.to_le_bytes());
        off += 4;
        mmap[off..off + 4].copy_from_slice(&(data.len() as u32).to_le_bytes());
        off += 4;
        mmap[off..off + 4].copy_from_slice(&(data.len() as u32).to_le_bytes());
        off += 4;
        mmap[off..off + data.len()].copy_from_slice(data);
        off += data.len();
        if padding > 0 {
            mmap[off..off + padding].fill(0);
            off += padding;
        }
        mmap[off..off + 4].copy_from_slice(&block_len.to_le_bytes());

        self.current_size += block_len as u64;
        Ok(())
    }

    fn write_raw(&mut self, data: &[u8]) -> io::Result<()> {
        if let Some(mmap) = &mut self.current_mmap {
            let pos = self.current_size as usize;
            if pos + data.len() > mmap.len() {
                return Err(io::Error::new(io::ErrorKind::OutOfMemory, "mmap buffer full"));
            }
            mmap[pos..pos + data.len()].copy_from_slice(data);
            self.current_size += data.len() as u64;
        }
        Ok(())
    }

    fn flush_current(&mut self) -> io::Result<()> {
        if let Some(mmap) = &mut self.current_mmap {
            mmap.flush()?;
        }
        if let Some(file) = &mut self.current_file {
            file.set_len(self.current_size)?;
            file.sync_all()?;
        }
        Ok(())
    }

    pub fn flush(&mut self) -> io::Result<()> {
        self.flush_current()
    }
}

impl Drop for PcapWriter {
    fn drop(&mut self) {
        let _ = self.flush();
    }
}