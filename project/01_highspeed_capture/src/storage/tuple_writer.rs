use std::fs::{File, OpenOptions};
use std::io::{self, Write};
use std::path::PathBuf;
use crate::parser::FiveTuple;

const FLUSH_THRESHOLD: usize = 64 * 1024;

pub struct TupleWriter {
    output_dir: PathBuf,
    size_limit: u64,
    current_file: Option<File>,
    current_size: u64,
    file_count: u64,
    buffer: Vec<u8>,
    use_binary: bool,
}

impl TupleWriter {
    pub fn new(output_dir: PathBuf, size_limit_mb: usize, use_binary: bool) -> io::Result<Self> {
        std::fs::create_dir_all(&output_dir)?;

        let mut writer = Self {
            output_dir,
            size_limit: (size_limit_mb as u64) * 1024 * 1024,
            current_file: None,
            current_size: 0,
            file_count: 0,
            buffer: Vec::with_capacity(FLUSH_THRESHOLD + 256),
            use_binary,
        };

        writer.create_new_file()?;
        Ok(writer)
    }

    fn create_new_file(&mut self) -> io::Result<()> {
        self.flush_buffer()?;

        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let ext = if self.use_binary { "dat" } else { "csv" };
        let filename = self.output_dir.join(format!("tuples_{}_{}.{}", timestamp, self.file_count, ext));
        self.file_count += 1;

        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(&filename)?;

        if !self.use_binary {
            writeln!(file, "timestamp,src_ip,src_port,dst_ip,dst_port,protocol,packet_size")?;
        }

        self.current_file = Some(file);
        self.current_size = 0;

        Ok(())
    }

    pub fn write_tuple(&mut self, tuple: &FiveTuple) -> io::Result<()> {
        if self.use_binary {
            let binary = tuple.to_binary();
            let record_size = binary.len();
            if self.current_size + (record_size as u64) > self.size_limit {
                self.create_new_file()?;
            }
            self.buffer.extend_from_slice(&binary);
        } else {
            let line = tuple.to_csv_line();
            let line_size = line.len();
            if self.current_size + (line_size as u64) > self.size_limit {
                self.create_new_file()?;
            }
            self.buffer.extend_from_slice(line.as_bytes());
        }

        if self.buffer.len() >= FLUSH_THRESHOLD {
            self.flush_buffer()?;
        }

        Ok(())
    }

    fn flush_buffer(&mut self) -> io::Result<()> {
        if self.buffer.is_empty() {
            return Ok(());
        }

        if let Some(file) = &mut self.current_file {
            file.write_all(&self.buffer)?;
            self.current_size += self.buffer.len() as u64;
        }

        self.buffer.clear();
        Ok(())
    }

    pub fn flush(&mut self) -> io::Result<()> {
        self.flush_buffer()?;
        if let Some(file) = &mut self.current_file {
            file.flush()?;
            file.sync_all()?;
        }
        Ok(())
    }
}

impl Drop for TupleWriter {
    fn drop(&mut self) {
        let _ = self.flush();
    }
}