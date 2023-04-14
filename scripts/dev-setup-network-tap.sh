#!/bin/bash

set -euo pipefail

HOST_DEV="eth0"
TAP_DEV="fc-1-tap0"
TAP_IP="172.16.0.1"
MASK_SHORT="/24"

usage() {
	echo "Usage: $(basename "$0") [-h <host dev>] [-t <tap dev>]"
	exit 1
}

while getopts ":h:t:" opt; do
	case $opt in
	h)
		HOST_DEV=$OPTARG
		;;
	t)
		TAP_DEV=$OPTARG
		;;
	\?)
		echo "Invalid option: -$OPTARG" >&2
		usage
		;;
	:)
		echo "Option -$OPTARG requires an argument." >&2
		usage
		;;
	esac
done

if [ ! -e /dev/net/tun ]; then
	mkdir -p /dev/net
	mknod /dev/net/tun c 10 200
	chmod 0666 /dev/net/tun
fi

ip link del "$TAP_DEV" 2>/dev/null || true

ip tuntap add dev "$TAP_DEV" mode tap
ip addr add "${TAP_IP}${MASK_SHORT}" dev "$TAP_DEV"
ip link set "$TAP_DEV" up

# enables ip forwarding
sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

# Replaces the ip address of the tap interface with the host interface
iptables -t nat -A POSTROUTING -o "$HOST_DEV" -j MASQUERADE

# Adds a rule to the Linux kernel's firewall (iptables) to allow packets that
# are related to or established from existing connections to be forwarded.
# This is necessary for allowing responses to outgoing packets to return to the
# originating device.
iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# Adds a rule to allow forwarding of packets from the tap interface to the
# host interface. This is necessary for allowing traffic from vms or other
# virtual networks to reach devices on the physical network.
iptables -A FORWARD -i "$TAP_DEV" -o "$HOST_DEV" -j ACCEPT
