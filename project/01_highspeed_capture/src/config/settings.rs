use serde::Deserialize;
use std::path::{Path, PathBuf};
use crate::storage::StorageMode;

#[derive(Debug, Deserialize, Clone)]
pub struct Settings {
    pub interface: String,
    pub mode: StorageMode,
    pub output_dir: PathBuf,
    pub buffer_size: usize,
    pub pcap: PcapSettings,
    pub afxdp: AfxdpSettings,
    pub performance: PerformanceSettings,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PcapSettings {
    pub size_limit_mb: usize,
    pub compression: bool,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AfxdpSettings {
    pub umem_size: usize,
    pub fill_ring_size: usize,
    pub comp_ring_size: usize,
    pub rx_ring_size: usize,
    pub frame_size: usize,
    pub use_huge_pages: bool,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PerformanceSettings {
    pub cpu_core_affinity: Vec<usize>,
    pub num_parser_threads: usize,
    pub num_writer_threads: usize,
}

impl Settings {
    pub fn load<P: AsRef<Path>>(path: P) -> anyhow::Result<Self> {
        let path = path.as_ref();
        if path.exists() {
            let content = std::fs::read_to_string(path)?;
            Ok(toml::from_str(&content)?)
        } else {
            Ok(Self::default())
        }
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            interface: "eth0".to_string(),
            mode: StorageMode::Full,
            output_dir: PathBuf::from("./captures"),
            buffer_size: 4096,
            pcap: PcapSettings {
                size_limit_mb: 1024,
                compression: false,
            },
            afxdp: AfxdpSettings {
                umem_size: 536870912,
                fill_ring_size: 4096,
                comp_ring_size: 4096,
                rx_ring_size: 4096,
                frame_size: 2048,
                use_huge_pages: true,
            },
            performance: PerformanceSettings {
                cpu_core_affinity: vec![0, 1, 2, 3],
                num_parser_threads: 2,
                num_writer_threads: 2,
            },
        }
    }
}