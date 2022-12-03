#!/bin/bash

set -e

source ../.env

# create an empty rootfs
dd if=/dev/zero of=rootfs.ext4 bs=1M count=100
mkfs.ext4 "$FIRECRACKER_ROOTFS"
mkdir -p /tmp/takaro/
mount "$FIRECRACKER_ROOTFS" /tmp/takaro/my-rootfs

docker run -i --rm \
	-v /tmp/takaro/my-rootfs:/my-rootfs \
	-v "../packages/vm-agent/target/release/vm-agent:/usr/local/bin/agent" \
	-v "../packages/vm-agent/agent-service:/etc/init.d/agent" \
	alpine sh <./setup-image.sh

umount /tmp/takaro/my-rootfs
