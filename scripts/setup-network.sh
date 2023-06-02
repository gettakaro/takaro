#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

if [[ ! -e /dev/net/tun ]]; then
	echo "creating /dev/net/tun..."
	mkdir -p /dev/net
	mknod /dev/net/tun c 10 200
	chmod 0666 /dev/net/tun
fi

sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

iptables -t nat -A POSTROUTING -j MASQUERADE

iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -j ACCEPT
