#!/bin/bash

# Reset sockets if they exist
mkdir -p /tmp/takaro
rm /tmp/takaro/*.socket

function build_agent() {
	cd ./packages/vm-agent
	./build.sh
	cd ../..
}

build_agent

# Create rootfs
sudo sh ./scripts/create-rootfs.sh

# # Start firecracker
firecracker --api-sock /tmp/takaro/firecracker.socket
