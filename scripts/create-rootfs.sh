#!/bin/bash

set -e

source .env

# create an empty rootfs
dd if=/dev/zero of="$FIRECRACKER_ROOTFS" bs=1M count=100
mkfs.ext4 "$FIRECRACKER_ROOTFS"
mkdir -p /tmp/takaro/my-rootfs
mount "$FIRECRACKER_ROOTFS" /tmp/takaro/my-rootfs/

docker run -i --rm \
	-v /tmp/takaro/my-rootfs:/my-rootfs \
	-v "$VM_AGENT_BINARY:/usr/local/bin/agent" \
	-v "$VM_AGENT_SERVICE:/etc/init.d/agent" \
	alpine sh <./scripts/setup-image.sh

umount /tmp/takaro/my-rootfs/
