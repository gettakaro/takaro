#!/bin/bash
# NOTE: this script should run from the repo root.

FIRECRACKER_ROOTFS=./packages/app-agent/src/lib/firecracker/rootfs.ext4
VM_AGENT_BINARY=./packages/vm-agent/target/x86_64-unknown-linux-musl/debug/vm-agent
VM_AGENT_SERVICE=./packages/vm-agent/agent-service

cargo build --manifest-path=./packages/vm-agent/Cargo.toml

# create an empty rootfs
dd if=/dev/zero of="$FIRECRACKER_ROOTFS" bs=1M count=500
mkfs.ext4 "$FIRECRACKER_ROOTFS"
mkdir -p /tmp/takaro/my-rootfs
sudo mount "$FIRECRACKER_ROOTFS" /tmp/takaro/my-rootfs/

docker run -i --rm \
	-v /tmp/takaro/my-rootfs:/my-rootfs \
	-v "$VM_AGENT_BINARY:/usr/local/bin/agent" \
	-v "$VM_AGENT_SERVICE:/etc/init.d/agent" \
	alpine sh <./containers/vm-agent-image/build.sh

sudo umount /tmp/takaro/my-rootfs/

# Reset sockets if they exist
mkdir -p /tmp/takaro
rm /tmp/takaro/*.socket

echo "Starting firecracker..."

# # Start firecracker
firecracker --api-sock /tmp/takaro/firecracker.socket --log-path logs.fifo --level debug --show-level --show-log-origin
