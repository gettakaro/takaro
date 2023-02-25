#!/bin/bash
# NOTE: this script should run from the repo root.

# Reset sockets if they exist
mkdir -p /tmp/takaro
rm /tmp/takaro/*.socket

# TODO: use cargo build from outside the vm-agent directory
function build_agent() {
	cd ./packages/vm-agent
	./build.sh
	cd ../..
}
build_agent

FIRECRACKER_ROOTFS=./packages/app-agent/src/lib/firecracker/rootfs.ext4

# create an empty rootfs
dd if=/dev/zero of="$FIRECRACKER_ROOTFS" bs=1M count=150
mkfs.ext4 "$FIRECRACKER_ROOTFS"
mkdir -p /tmp/takaro/my-rootfs
sudo mount "$FIRECRACKER_ROOTFS" /tmp/takaro/my-rootfs/

VM_AGENT_BINARY=./packages/vm-agent/target/release/vm-agent
VM_AGENT_SERVICE=./packages/vm-agent/agent-service

docker run -i --rm \
	-v /tmp/takaro/my-rootfs:/my-rootfs \
	-v "$VM_AGENT_BINARY:/usr/local/bin/agent" \
	-v "$VM_AGENT_SERVICE:/etc/init.d/agent" \
	alpine sh <./containers/vm-agent-image/build.sh

sudo umount /tmp/takaro/my-rootfs/

echo "Starting firecracker..."

# # Start firecracker
firecracker --api-sock /tmp/takaro/firecracker.socket
