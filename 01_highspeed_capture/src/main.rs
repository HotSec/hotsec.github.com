use clap::Parser;
use log::{info, error};
use std::sync::Arc;
use tokio::signal;

mod capture;
mod parser;
mod storage;
mod config;
mod cli;

use crate::cli::Args;
use crate::config::Settings;
use crate::capture::PacketCapture;
use crate::storage::{StorageManager, PacketData};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let args = Args::parse();
    let mut settings = Settings::load(&args.config)?;
    args.apply_to_settings(&mut settings);

    info!("Starting Highspeed Capture v{}", env!("CARGO_PKG_VERSION"));
    info!("Interface: {}", settings.interface);
    info!("Mode: {:?}", settings.mode);
    info!("Output: {}", settings.output_dir.display());

    let (tx, rx) = crossbeam::channel::bounded::<PacketData>(settings.buffer_size);

    let storage = Arc::new(StorageManager::new(&settings, rx)?);
    let capture = PacketCapture::new(&settings, tx)?;

    let storage_handle = {
        let storage = storage.clone();
        tokio::spawn(async move {
            if let Err(e) = storage.run().await {
                error!("Storage error: {}", e);
            }
        })
    };

    let capture_handle = tokio::task::spawn_blocking(move || {
        let rt = tokio::runtime::Handle::current();
        match rt.block_on(capture.run()) {
            Err(e) => error!("Capture error: {}", e),
            _ => {}
        }
    });

    tokio::select! {
        result = capture_handle => {
            if let Err(e) = result {
                error!("Capture task failed: {}", e);
            }
        }
        result = storage_handle => {
            if let Err(e) = result {
                error!("Storage task failed: {}", e);
            }
        }
        _ = signal::ctrl_c() => {
            info!("Received Ctrl+C, shutting down gracefully...");
        }
    }

    if let Ok(mut s) = Arc::try_unwrap(storage) {
        s.flush()?;
        s.print_stats();
    }

    Ok(())
}