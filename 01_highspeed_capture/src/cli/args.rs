use clap::Parser;
use std::path::PathBuf;
use crate::config::Settings;
use crate::storage::StorageMode;

#[derive(Parser, Debug)]
#[command(
    name = "highspeed-capture",
    version,
    about = "High-performance 40Gbps packet capture tool",
    long_about = "High-performance packet capture tool using AF_XDP for 40Gbps throughput. \
                  Supports saving full packet data (PCAPNG) or 5-tuple metadata."
)]
pub struct Args {
    #[arg(short, long, help = "Network interface to capture from")]
    pub interface: Option<String>,

    #[arg(short, long, help = "Configuration file path", default_value = "config/default.toml")]
    pub config: PathBuf,

    #[arg(short, long, value_enum, help = "Storage mode: full or tuple")]
    pub mode: Option<StorageMode>,

    #[arg(short, long, help = "Output directory for captured data")]
    pub output_dir: Option<PathBuf>,

    #[arg(short = 'b', long, help = "Buffer size in MB")]
    pub buffer_size: Option<usize>,

    #[arg(short = 's', long, help = "PCAP file size limit in MB")]
    pub pcap_size_limit: Option<usize>,

    #[arg(short = 'v', long, help = "Increase verbosity")]
    pub verbose: bool,

    #[arg(short = 'q', long, help = "Quiet mode")]
    pub quiet: bool,
}

impl clap::ValueEnum for StorageMode {
    fn value_variants<'a>() -> &'a [Self] {
        &[Self::Full, Self::Tuple]
    }

    fn to_possible_value<'a>(&self) -> Option<clap::builder::PossibleValue> {
        match self {
            Self::Full => Some(clap::builder::PossibleValue::new("full")),
            Self::Tuple => Some(clap::builder::PossibleValue::new("tuple")),
        }
    }
}

impl Args {
    pub fn apply_to_settings(&self, settings: &mut Settings) {
        if let Some(interface) = &self.interface {
            settings.interface = interface.clone();
        }
        if let Some(mode) = self.mode {
            settings.mode = mode;
        }
        if let Some(output_dir) = &self.output_dir {
            settings.output_dir = output_dir.clone();
        }
        if let Some(buffer_size) = self.buffer_size {
            settings.buffer_size = buffer_size;
        }
        if let Some(pcap_size_limit) = self.pcap_size_limit {
            settings.pcap.size_limit_mb = pcap_size_limit;
        }
    }
}