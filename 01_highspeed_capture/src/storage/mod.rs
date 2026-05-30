use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use log::{info, warn, error};
use crate::config::Settings;
use crate::parser::FiveTuple;
use crate::storage::pcap_writer::PcapWriter;
use crate::storage::tuple_writer::TupleWriter;

mod pcap_writer;
mod tuple_writer;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StorageMode {
    Full,
    Tuple,
}

impl<'de> serde::Deserialize<'de> for StorageMode {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        match s.to_lowercase().as_str() {
            "full" => Ok(StorageMode::Full),
            "tuple" => Ok(StorageMode::Tuple),
            _ => Err(serde::de::Error::custom(format!("unknown storage mode: {}", s))),
        }
    }
}

pub struct PacketData {
    pub data: Vec<u8>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

pub struct StorageManager {
    mode: StorageMode,
    pcap_writer: Option<Mutex<PcapWriter>>,
    tuple_writer: Option<Mutex<TupleWriter>>,
    packet_channel: crossbeam::channel::Receiver<PacketData>,
    packets_received: AtomicU64,
    packets_written: AtomicU64,
    bytes_written: AtomicU64,
    parse_errors: AtomicU64,
    no_tuple: AtomicU64,
    errors: AtomicU64,
}

impl StorageManager {
    pub fn new(
        settings: &Settings,
        rx: crossbeam::channel::Receiver<PacketData>,
    ) -> anyhow::Result<Self> {
        let mode = settings.mode;

        let pcap_writer = if matches!(mode, StorageMode::Full) {
            let writer = PcapWriter::new(settings.output_dir.join("pcap"), settings.pcap.size_limit_mb)?;
            Some(Mutex::new(writer))
        } else {
            None
        };

        let tuple_writer = if matches!(mode, StorageMode::Tuple) {
            let writer = TupleWriter::new(
                settings.output_dir.join("tuples"),
                settings.pcap.size_limit_mb,
                true,
            )?;
            Some(Mutex::new(writer))
        } else {
            None
        };

        info!("Storage manager initialized in {:?} mode", mode);

        Ok(Self {
            mode,
            pcap_writer,
            tuple_writer,
            packet_channel: rx,
            packets_received: AtomicU64::new(0),
            packets_written: AtomicU64::new(0),
            bytes_written: AtomicU64::new(0),
            parse_errors: AtomicU64::new(0),
            no_tuple: AtomicU64::new(0),
            errors: AtomicU64::new(0),
        })
    }

    pub fn run(&self) -> anyhow::Result<()> {
        info!("Storage manager running in {:?} mode", self.mode);

        let mut last_report = std::time::Instant::now();
        let mut report_received = 0u64;
        let mut batch: Vec<PacketData> = Vec::with_capacity(256);

        loop {
            match self.packet_channel.recv_timeout(std::time::Duration::from_millis(50)) {
                Ok(packet) => {
                    batch.push(packet);
                    while batch.len() < 256 {
                        match self.packet_channel.try_recv() {
                            Ok(p) => batch.push(p),
                            Err(_) => break,
                        }
                    }
                }
                Err(crossbeam::channel::RecvTimeoutError::Timeout) => {}
                Err(crossbeam::channel::RecvTimeoutError::Disconnected) => {
                    info!("Packet channel closed, storage manager exiting");
                    break;
                }
            }

            if !batch.is_empty() {
                let batch_len = batch.len() as u64;
                report_received += batch_len;
                self.packets_received.fetch_add(batch_len, Ordering::Relaxed);

                match self.mode {
                    StorageMode::Full => {
                        if let Some(writer) = &self.pcap_writer {
                            if let Ok(mut w) = writer.lock() {
                                for packet in &batch {
                                    if let Err(e) = w.write_packet(&packet.data, packet.timestamp) {
                                        error!("PCAP write error: {}", e);
                                        self.errors.fetch_add(1, Ordering::Relaxed);
                                    } else {
                                        self.packets_written.fetch_add(1, Ordering::Relaxed);
                                        self.bytes_written.fetch_add(packet.data.len() as u64, Ordering::Relaxed);
                                    }
                                }
                            }
                        }
                    }
                    StorageMode::Tuple => {
                        if let Some(writer) = &self.tuple_writer {
                            if let Ok(mut w) = writer.lock() {
                                for packet in &batch {
                                    match FiveTuple::from_ethernet_slice(&packet.data, packet.data.len() as u32) {
                                        Some(tuple) => {
                                            if let Err(e) = w.write_tuple(&tuple) {
                                                error!("Tuple write error: {}", e);
                                                self.errors.fetch_add(1, Ordering::Relaxed);
                                            } else {
                                                self.packets_written.fetch_add(1, Ordering::Relaxed);
                                            }
                                        }
                                        None => {
                                            self.no_tuple.fetch_add(1, Ordering::Relaxed);
                                        }
                                    }
                                    self.bytes_written.fetch_add(packet.data.len() as u64, Ordering::Relaxed);
                                }
                            }
                        }
                    }
                }

                batch.clear();
            }

            let elapsed = last_report.elapsed();
            if elapsed >= std::time::Duration::from_secs(5) {
                let secs = elapsed.as_secs().max(1);
                let pps = report_received / secs;
                let written = self.packets_written.load(Ordering::Relaxed);
                let parse_err = self.parse_errors.load(Ordering::Relaxed);
                let no_tuple = self.no_tuple.load(Ordering::Relaxed);
                let errors = self.errors.load(Ordering::Relaxed);
                info!(
                    "Storage: {} pps, written={}, parse_err={}, no_tuple={}, errors={}",
                    pps, written, parse_err, no_tuple, errors
                );
                let _ = self.flush();
                report_received = 0;
                last_report = std::time::Instant::now();
            }
        }

        self.flush()?;
        self.print_stats();
        info!("Storage manager stopped");
        Ok(())
    }

    pub fn flush(&self) -> anyhow::Result<()> {
        if let Some(writer) = &self.pcap_writer {
            if let Ok(mut w) = writer.lock() {
                w.flush()?;
            }
        }
        if let Some(writer) = &self.tuple_writer {
            if let Ok(mut w) = writer.lock() {
                w.flush()?;
            }
        }
        Ok(())
    }

    pub fn print_stats(&self) {
        let received = self.packets_received.load(Ordering::Relaxed);
        let written = self.packets_written.load(Ordering::Relaxed);
        let bytes = self.bytes_written.load(Ordering::Relaxed);
        let parse_err = self.parse_errors.load(Ordering::Relaxed);
        let no_tuple = self.no_tuple.load(Ordering::Relaxed);
        let errors = self.errors.load(Ordering::Relaxed);
        info!(
            "Storage stats: received={}, written={}, {} bytes ({:.2} MB), parse_errors={}, no_tuple={}, errors={}",
            received, written, bytes,
            bytes as f64 / (1024.0 * 1024.0),
            parse_err, no_tuple, errors
        );
    }
}