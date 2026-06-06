#!/bin/bash
set -e

INTERFACE="eth0"
DST_MAC="ff:ff:ff:ff:ff:ff"
SRC_MAC="3c:ec:ef:ab:68:c0"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }

TOTAL_DURATION=30

cleanup() {
    log "Cleaning up..."
    pgrep -f pktgen_sample 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    rm -f /proc/net/pktgen/eth0* 2>/dev/null || true
    tc qdisc del dev $INTERFACE clsact 2>/dev/null || true
}

trap cleanup EXIT

log "=== Step 1: Allocate huge pages (256MB) ==="
echo 128 > /proc/sys/vm/nr_hugepages 2>/dev/null || warn "Failed to allocate huge pages"
ACTUAL_HP=$(cat /proc/sys/vm/nr_hugepages)
log "Huge pages: ${ACTUAL_HP} x 2MB = $((ACTUAL_HP * 2))MB"

log "=== Step 2: Set up tc mirred (TX -> RX loopback) ==="
tc qdisc add dev $INTERFACE clsact
tc filter add dev $INTERFACE egress protocol all matchall action mirred ingress redirect dev $INTERFACE
log "tc mirred: egress -> ingress on $INTERFACE"

log "=== Step 3: Verify eth0 UP ==="
ip link set $INTERFACE up
sleep 1
ip link show $INTERFACE

log "=== Step 4: Disable hardware offloads ==="
ethtool -K $INTERFACE gro off 2>/dev/null || true
ethtool -K $INTERFACE lro off 2>/dev/null || true
ethtool -K $INTERFACE ntuple off 2>/dev/null || true

log "=== Step 5: Load pktgen ==="
modprobe pktgen 2>/dev/null || true
lsmod | grep pktgen

log "=== Step 6: Configure pktgen ==="

echo "rem_device_all" > /proc/net/pktgen/kpktgend_0
echo "add_device $INTERFACE@0" > /proc/net/pktgen/kpktgend_0

PGDEV="/proc/net/pktgen/$INTERFACE@0"
echo "min_pkt_size 64" > $PGDEV
echo "max_pkt_size 64" > $PGDEV
echo "count 100000000" > $PGDEV
echo "clone_skb 100000" > $PGDEV
echo "delay 0" > $PGDEV
echo "burst 256" > $PGDEV
echo "src_mac $SRC_MAC" > $PGDEV
echo "dst_mac $DST_MAC" > $PGDEV
echo "dst_min 10.0.0.1" > $PGDEV
echo "dst_max 10.0.0.254" > $PGDEV
echo "src_min 192.168.1.1" > $PGDEV
echo "src_max 192.168.1.1" > $PGDEV
echo "udp_src_min 1024" > $PGDEV
echo "udp_src_max 65535" > $PGDEV
echo "udp_dst_min 1024" > $PGDEV
echo "udp_dst_max 65535" > $PGDEV
echo "flag QUEUE_MAP_CPU" > $PGDEV

log "=== Step 7: Warm-up run (10M pkts, 64-byte) ==="
echo "count 10000000" > $PGDEV

START_TIME=$(date +%s.%N)
echo "start" > /proc/net/pktgen/pgctrl

log "Waiting for pktgen to finish..."
while true; do
    if grep -q "Result: OK:" /proc/net/pktgen/$INTERFACE@0 2>/dev/null; then
        break
    fi
    sleep 0.5
done
END_TIME=$(date +%s.%N)

DURATION=$(echo "$END_TIME - $START_TIME" | bc)
PKTS_SENT=$(grep "pkts-sofar:" /proc/net/pktgen/$INTERFACE@0 | awk '{print $NF}')
ERRORS=$(grep "errors:" /proc/net/pktgen/$INTERFACE@0 | awk '{print $NF}')

if [ -n "$PKTS_SENT" ] && [ "$DURATION" != "0" ] && [ "$DURATION" != "" ]; then
    ACTUAL_PPS=$(echo "scale=0; $PKTS_SENT / $DURATION" | bc)
    ACTUAL_MBPS=$(echo "scale=2; $PKTS_SENT * 64 * 8 / $DURATION / 1000000" | bc)
    log "Warm-up: ${PKTS_SENT} pkts in ${DURATION}s, ${ACTUAL_PPS} pps, ${ACTUAL_MBPS} Mbps, ${ERRORS} errors"
fi
grep "Result:" /proc/net/pktgen/$INTERFACE@0

log ""
log "=== Step 8: Full 10Gbps test (100M pkts, ${TOTAL_DURATION}s) ==="
echo "count 100000000" > $PGDEV

CAPTURE_DIR="/tmp/capture_test"
rm -rf $CAPTURE_DIR
mkdir -p $CAPTURE_DIR

CAPTURE_BIN="/opt/test/target/release/highspeed-capture"

log "Starting AF_XDP capture..."
timeout ${TOTAL_DURATION} $CAPTURE_BIN -i $INTERFACE -m tuple -o $CAPTURE_DIR -v &
CAPTURE_PID=$!
sleep 2

log "Starting pktgen..."
echo "start" > /proc/net/pktgen/pgctrl

log "Waiting ${TOTAL_DURATION}s..."
wait $CAPTURE_PID 2>/dev/null || true

log ""
log "=== Step 9: Results ==="

echo "--- Pktgen TX ---"
grep "Result:" /proc/net/pktgen/$INTERFACE@0 2>/dev/null || echo "No result yet"
PKTS_SENT_FINAL=$(grep "pkts-sofar:" /proc/net/pktgen/$INTERFACE@0 | awk '{print $NF}')
ERRORS_FINAL=$(grep "errors:" /proc/net/pktgen/$INTERFACE@0 | awk '{print $NF}')

echo ""
echo "--- Capture Files ---"
ls -lhR $CAPTURE_DIR/ 2>/dev/null || echo "No capture files"

echo ""
echo "--- dmesg (AF_XDP) ---"
dmesg | grep -iE "xdp|afxdp|highspeed" | tail -30 || echo "No XDP messages"

log ""
log "=== Summary ==="
log "Pktgen TX: ${PKTS_SENT_FINAL:-?} pkts, ${ERRORS_FINAL:-?} errors"
log "Test complete."