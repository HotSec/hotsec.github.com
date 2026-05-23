use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use log::{info, error};
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
    packets_written: AtomicU64,
    bytes_written: AtomicU64,
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
            packets_written: AtomicU64::new(0),
            bytes_written: AtomicU64::new(0),
            errors: AtomicU64::new(0),
        })
    }

    pub async fn run(&self) -> anyhow::Result<()> {
        info!("Storage manager running");

        loop {
            match self.packet_channel.recv() {
                Ok(packet) => {
                    let data_len = packet.data.len() as u64;

                    match self.mode {
                        StorageMode::Full => {
                            if let Some(writer) = &self.pcap_writer {
                                if let Ok(mut w) = writer.lock() {
                                    if let Err(e) = w.write_packet(&packet.data, packet.timestamp) {
                                        error!("PCAP write error: {}", e);
                                        self.errors.fetch_add(1, Ordering::Relaxed);
                                    }
                                }
                            }
                        }
                        StorageMode::Tuple => {
                            if let Ok(headers) = etherparse::PacketHeaders::from_ethernet_slice(&packet.data) {
                                if let Some(tuple) = FiveTuple::from_packet(&headers, packet.data.len() as u32) {
                                    if let Some(writer) = &self.tuple_writer {
                                        if let Ok(mut w) = writer.lock() {
                                            if let Err(e) = w.write_tuple(&tuple) {
                                                error!("Tuple write error: {}", e);
                                                self.errors.fetch_add(1, Ordering::Relaxed);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    self.packets_written.fetch_add(1, Ordering::Relaxed);
                    self.bytes_written.fetch_add(data_len, Ordering::Relaxed);
                }
                Err(_) => {
                    info!("Packet channel closed, storage manager exiting");
                    break;
                }
            }
        }

        Ok(())
    }

    pub fn flush(&mut self) -> anyhow::Result<()> {
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
        let packets = self.packets_written.load(Ordering::Relaxed);
        let bytes = self.bytes_written.load(Ordering::Relaxed);
        let errors = self.errors.load(Ordering::Relaxed);
        info!(
            "Stats: {} packets, {} bytes ({:.2} MB), {} errors",
            packets,
            bytes,
            bytes as f64 / (1024.0 * 1024.0),
            errors
        );
    }
}