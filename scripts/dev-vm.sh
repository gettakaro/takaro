#!/bin/bash

set -euom pipefail

FC_KERNEL="$PWD/firecracker/vmlinux.bin"
FC_ROOTFS="$PWD/firecracker/rootfs.ext4"

VM_NODE_HELPER="$PWD/firecracker/vm-node-helper"

build_vm_node_helper() {
	rm -rf "$VM_NODE_HELPER"

	mkdir -p "$VM_NODE_HELPER/node_modules/@takaro/"

	npm ci

	npm run-script -w packages/lib-config build
	npm run-script -w packages/lib-util build
	npm run-script -w packages/lib-apiclient build
	npm run-script -w packages/lib-auth build
	npm run-script -w packages/lib-db build
	npm run-script -w packages/lib-modules build
	npm run-script -w packages/lib-gameserver build
	npm run-script -w packages/lib-queues build
	npm run-script -w packages/lib-http build
	npm run-script -w packages/lib-function-helpers build

	npm run-script -w packages/test build

	cp -r -L ./node_modules/@takaro/config "$VM_NODE_HELPER/node_modules/@takaro"
	cp -r -L ./node_modules/@takaro/helpers "$VM_NODE_HELPER/node_modules/@takaro"
	cp -r -L ./node_modules/@takaro/apiclient "$VM_NODE_HELPER/node_modules/@takaro"
	cp -r -L ./node_modules/@takaro/util "$VM_NODE_HELPER/node_modules/@takaro"

	cat >"$VM_NODE_HELPER/package.json" <<EOF
{
  "name": "vm-node-helper",
  "dependencies": {
    "@takaro/apiclient": "*",
    "@takaro/config": "*",
    "@takaro/helpers": "*",
    "axios": "^1.3.4"
  }
}
EOF

	(
		cd "$VM_NODE_HELPER" || return
		npm i
	)
}

ensure_kernel() {
	ARCH="$(uname -m)"

	if [ ! -e "$FC_KERNEL" ]; then
		wget -q "https://s3.amazonaws.com/spec.ccfc.min/ci-artifacts/kernels/$ARCH/vmlinux-5.10.bin" -O "$FC_KERNEL"
		echo "Saved kernel at $FC_KERNEL"
	fi
}

create_rootfs() {
	# create an empty rootfs
	dd if=/dev/zero of="$FC_ROOTFS" bs=1M count=100
	mkfs.ext4 "$FC_ROOTFS"
	mkdir -p /tmp/takaro/my-rootfs

	sudo mount "$FC_ROOTFS" /tmp/takaro/my-rootfs/

	docker run -i --rm \
		-v /tmp/takaro/my-rootfs:/my-rootfs \
		-v "$PWD/packages/vm-agent/target/x86_64-unknown-linux-musl/release/vm-agent:/usr/local/bin/agent" \
		-v "$PWD/packages/vm-agent/agent-service:/etc/init.d/agent" \
		-v "$VM_NODE_HELPER:/app" \
		alpine sh <"$PWD/containers/vm-agent/build.sh"

	sudo umount /tmp/takaro/my-rootfs/
}

build_vm_agent() {
	cargo build --release --manifest-path=./packages/vm-agent/Cargo.toml
}

######################################## MAIN SCRIPT ########################################

mkdir -p ./firecracker

ensure_kernel

build_vm_agent

build_vm_node_helper

create_rootfs
