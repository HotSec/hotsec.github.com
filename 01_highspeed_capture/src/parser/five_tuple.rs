use etherparse::PacketHeaders;
use std::net::{Ipv4Addr, Ipv6Addr};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Protocol {
    Tcp,
    Udp,
    Icmp,
    Icmpv6,
    Other(u8),
}

impl Protocol {
    pub fn to_u8(self) -> u8 {
        match self {
            Protocol::Tcp => 6,
            Protocol::Udp => 17,
            Protocol::Icmp => 1,
            Protocol::Icmpv6 => 58,
            Protocol::Other(p) => p,
        }
    }

    pub fn display_name(self) -> &'static str {
        match self {
            Protocol::Tcp => "TCP",
            Protocol::Udp => "UDP",
            Protocol::Icmp => "ICMP",
            Protocol::Icmpv6 => "ICMPv6",
            Protocol::Other(_) => "OTHER",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct FiveTuple {
    pub src_ip: IpAddr,
    pub dst_ip: IpAddr,
    pub src_port: u16,
    pub dst_port: u16,
    pub protocol: Protocol,
    pub timestamp: DateTime<Utc>,
    pub packet_size: u32,
}

#[repr(C, packed)]
struct BinaryTupleV4 {
    src_ip: [u8; 4],
    dst_ip: [u8; 4],
    src_port: [u8; 2],
    dst_port: [u8; 2],
    protocol: u8,
    _reserved: [u8; 3],
    packet_size: [u8; 4],
    timestamp_ns: [u8; 8],
}

#[repr(C, packed)]
struct BinaryTupleV6 {
    src_ip: [u8; 16],
    dst_ip: [u8; 16],
    src_port: [u8; 2],
    dst_port: [u8; 2],
    protocol: u8,
    _reserved: [u8; 3],
    packet_size: [u8; 4],
    timestamp_ns: [u8; 8],
}

impl FiveTuple {
    pub fn from_packet(headers: &PacketHeaders, packet_size: u32) -> Option<Self> {
        let (src_ip, dst_ip, protocol) = match &headers.net {
            Some(etherparse::NetHeaders::Ipv4(header, _)) => {
                let proto_num = header.protocol.0;
                let protocol = match proto_num {
                    6 => Protocol::Tcp,
                    17 => Protocol::Udp,
                    1 => Protocol::Icmp,
                    p => Protocol::Other(p),
                };
                (
                    IpAddr::V4(header.source.into()),
                    IpAddr::V4(header.destination.into()),
                    protocol,
                )
            }
            Some(etherparse::NetHeaders::Ipv6(header, _)) => {
                let proto_num = header.next_header.0;
                let protocol = match proto_num {
                    6 => Protocol::Tcp,
                    17 => Protocol::Udp,
                    58 => Protocol::Icmpv6,
                    p => Protocol::Other(p),
                };
                (
                    IpAddr::V6(header.source.into()),
                    IpAddr::V6(header.destination.into()),
                    protocol,
                )
            }
            _ => return None,
        };

        let (src_port, dst_port) = match &headers.transport {
            Some(etherparse::TransportHeader::Tcp(header)) => {
                (header.source_port, header.destination_port)
            }
            Some(etherparse::TransportHeader::Udp(header)) => {
                (header.source_port, header.destination_port)
            }
            _ => (0, 0),
        };

        Some(Self {
            src_ip,
            dst_ip,
            src_port,
            dst_port,
            protocol,
            timestamp: Utc::now(),
            packet_size,
        })
    }

    pub fn from_ethernet_slice(data: &[u8], packet_size: u32) -> Option<Self> {
        if data.len() < 14 {
            return None;
        }

        let ether_type = u16::from_be_bytes([data[12], data[13]]);

        match ether_type {
            0x0800 => Self::parse_ipv4(&data[14..], packet_size),
            0x86DD => Self::parse_ipv6(&data[14..], packet_size),
            _ => None,
        }
    }

    fn parse_ipv4(data: &[u8], packet_size: u32) -> Option<Self> {
        if data.len() < 20 {
            return None;
        }

        let version = data[0] >> 4;
        if version != 4 {
            return None;
        }

        let ihl = (data[0] & 0x0F) as usize * 4;
        if ihl < 20 || data.len() < ihl {
            return None;
        }

        let proto_num = data[9];
        let protocol = match proto_num {
            6 => Protocol::Tcp,
            17 => Protocol::Udp,
            1 => Protocol::Icmp,
            p => Protocol::Other(p),
        };

        let src_ip = IpAddr::V4(Ipv4Addr::new(data[12], data[13], data[14], data[15]));
        let dst_ip = IpAddr::V4(Ipv4Addr::new(data[16], data[17], data[18], data[19]));

        let (src_port, dst_port) = if data.len() > ihl + 4 {
            Self::parse_transport_ports(&data[ihl..], proto_num)
        } else {
            (0, 0)
        };

        Some(Self {
            src_ip,
            dst_ip,
            src_port,
            dst_port,
            protocol,
            timestamp: Utc::now(),
            packet_size,
        })
    }

    fn parse_ipv6(data: &[u8], packet_size: u32) -> Option<Self> {
        if data.len() < 40 {
            return None;
        }

        let version = data[0] >> 4;
        if version != 6 {
            return None;
        }

        let proto_num = data[6];
        let protocol = match proto_num {
            6 => Protocol::Tcp,
            17 => Protocol::Udp,
            58 => Protocol::Icmpv6,
            p => Protocol::Other(p),
        };

        let mut src_bytes = [0u8; 16];
        src_bytes.copy_from_slice(&data[8..24]);
        let src_ip = IpAddr::V6(Ipv6Addr::from(src_bytes));

        let mut dst_bytes = [0u8; 16];
        dst_bytes.copy_from_slice(&data[24..40]);
        let dst_ip = IpAddr::V6(Ipv6Addr::from(dst_bytes));

        let (src_port, dst_port) = if data.len() > 40 + 4 {
            Self::parse_transport_ports(&data[40..], proto_num)
        } else {
            (0, 0)
        };

        Some(Self {
            src_ip,
            dst_ip,
            src_port,
            dst_port,
            protocol,
            timestamp: Utc::now(),
            packet_size,
        })
    }

    fn parse_transport_ports(data: &[u8], proto: u8) -> (u16, u16) {
        if data.len() < 4 {
            return (0, 0);
        }
        match proto {
            6 | 17 => {
                let src_port = u16::from_be_bytes([data[0], data[1]]);
                let dst_port = u16::from_be_bytes([data[2], data[3]]);
                (src_port, dst_port)
            }
            _ => (0, 0),
        }
    }

    pub fn to_csv_line(&self) -> String {
        let src_ip_str = match &self.src_ip {
            IpAddr::V4(ip) => ip.to_string(),
            IpAddr::V6(ip) => ip.to_string(),
        };
        let dst_ip_str = match &self.dst_ip {
            IpAddr::V4(ip) => ip.to_string(),
            IpAddr::V6(ip) => ip.to_string(),
        };

        format!(
            "{},{},{},{},{},{},{}\n",
            self.timestamp.format("%Y-%m-%dT%H:%M:%S%.6fZ"),
            src_ip_str,
            self.src_port,
            dst_ip_str,
            self.dst_port,
            self.protocol.display_name(),
            self.packet_size
        )
    }

    pub fn to_binary(&self) -> Vec<u8> {
        let ts_nanos = self.timestamp.timestamp_nanos_opt().unwrap_or_default();

        match (&self.src_ip, &self.dst_ip) {
            (IpAddr::V4(src), IpAddr::V4(dst)) => {
                let record = BinaryTupleV4 {
                    src_ip: src.octets(),
                    dst_ip: dst.octets(),
                    src_port: self.src_port.to_be_bytes(),
                    dst_port: self.dst_port.to_be_bytes(),
                    protocol: self.protocol.to_u8(),
                    _reserved: [0; 3],
                    packet_size: self.packet_size.to_be_bytes(),
                    timestamp_ns: ts_nanos.to_be_bytes(),
                };
                unsafe {
                    std::slice::from_raw_parts(
                        &record as *const _ as *const u8,
                        std::mem::size_of::<BinaryTupleV4>(),
                    )
                    .to_vec()
                }
            }
            (IpAddr::V6(src), IpAddr::V6(dst)) => {
                let record = BinaryTupleV6 {
                    src_ip: src.octets(),
                    dst_ip: dst.octets(),
                    src_port: self.src_port.to_be_bytes(),
                    dst_port: self.dst_port.to_be_bytes(),
                    protocol: self.protocol.to_u8(),
                    _reserved: [0; 3],
                    packet_size: self.packet_size.to_be_bytes(),
                    timestamp_ns: ts_nanos.to_be_bytes(),
                };
                unsafe {
                    std::slice::from_raw_parts(
                        &record as *const _ as *const u8,
                        std::mem::size_of::<BinaryTupleV6>(),
                    )
                    .to_vec()
                }
            }
            _ => Vec::new(),
        }
    }
}