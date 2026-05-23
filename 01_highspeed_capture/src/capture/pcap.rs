use log::info;
use crate::config::Settings;
use crate::storage::PacketData;

pub struct PacketCapture {
    settings: Settings,
    sender: crossbeam::channel::Sender<PacketData>,
}

impl PacketCapture {
    pub fn new(
        settings: &Settings,
        sender: crossbeam::channel::Sender<PacketData>,
    ) -> anyhow::Result<Self> {
        info!("Initializing libpcap capture on interface {}", settings.interface);

        Ok(Self {
            settings: settings.clone(),
            sender,
        })
    }

    pub async fn run(&self) -> anyhow::Result<()> {
        use std::process::Command;

        info!("Starting packet capture loop using tcpdump");

        let interface = &self.settings.interface;
        let output = Command::new("tcpdump")
            .args([
                "-i", interface,
                "-n",
                "-l",
                "-w", "-",
            ])
            .output();

        match output {
            Ok(result) => {
                info!("tcpdump exited with status: {}", result.status);
            }
            Err(e) => {
                info!("Failed to run tcpdump: {}", e);
            }
        }

        Ok(())
    }
}

impl Drop for PacketCapture {
    fn drop(&mut self) {
        info!("Closed libpcap capture");
    }
}