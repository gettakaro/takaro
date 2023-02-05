#!/bin/bash

set -ex

# sudo ip addr add 172.16.0.1/24 dev tap0
# sudo ip link set tap0 up
# sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
sudo iptables -t nat -A POSTROUTING -o enp0s25 -j MASQUERADE
sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i tap0 -o enp0s25 -j ACCEPT
