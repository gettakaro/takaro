#!/bin/bash

set -euom pipefail

source "$PWD/.env.example"
source "$PWD/.env"

CURL=(curl --show-error --header "Content-Type: application/json" --unix-socket "${FC_SOCKET}" --write-out "HTTP %{http_code}")

curl_put() {
	local URL_PATH="$1"
	local OUTPUT RC
	OUTPUT="$("${CURL[@]}" -X PUT --data @- "http://localhost/${URL_PATH#/}")"
	RC="$?"
	if [ "$RC" -ne 0 ]; then
		echo "Error: curl PUT ${URL_PATH} failed with exit code $RC, output:"
		echo "$OUTPUT"
		return 1
	fi
	# Error if output doesn't end with "HTTP 2xx"
	if [[ "$OUTPUT" != *HTTP\ 2[0-9][0-9] ]]; then
		echo "Error: curl PUT ${URL_PATH} failed with non-2xx HTTP status code, output:"
		echo "$OUTPUT"
		return 1
	fi
}

build_vm_node_helper() {
	rm -rf "$VM_NODE_HELPER"

	mkdir -p "$VM_NODE_HELPER/node_modules/@takaro/"

	cp -r -L ./node_modules/@takaro/{config,helpers,apiclient} "$VM_NODE_HELPER/node_modules/@takaro"

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
	dd if=/dev/zero of="$FC_ROOTFS" bs=1M count=500
	mkfs.ext4 "$FC_ROOTFS"
	mkdir -p /tmp/takaro/my-rootfs

	sudo mount "$FC_ROOTFS" /tmp/takaro/my-rootfs/

	docker run -i --rm \
		-v /tmp/takaro/my-rootfs:/my-rootfs \
		-v "$VM_AGENT_BINARY:/usr/local/bin/agent" \
		-v "$VM_AGENT_SERVICE:/etc/init.d/agent" \
		-v "$VM_NODE_HELPER:/app" \
		node:18-alpine sh <"$VM_AGENT_IMAGE_BUILD_SCRIPT"

	sudo umount /tmp/takaro/my-rootfs/
}

build_vm_agent() {
	cargo build --manifest-path=./packages/vm-agent/Cargo.toml
}

start_firecracker() {
	touch "$FC_LOGFILE"
	touch "$FC_METRICS"

	rm -f "$FC_SOCKET"
	rm -f "$VM_AGENT_SOCKET"

	firecracker --api-sock "$FC_SOCKET"

	echo "firecracker started"
}

configure_microvm() {
	curl_put '/logger' <<EOF
{
  "level": "Debug",
  "log_path": "$FC_LOGFILE",
  "show_level": false,
  "show_log_origin": false
}
EOF

	curl_put '/metrics' <<EOF
{
  "metrics_path": "$FC_METRICS"
}
EOF

	#curl_put '/machine-config' <<EOF
	#{
	#  "vcpu_count": 1,
	#  "mem_size_mib": 128
	#}
	#EOF

	curl_put '/boot-source' <<EOF
{
  "kernel_image_path": "$FC_KERNEL",
  "boot_args": "$FC_KERNEL_BOOT_ARGS"
}
EOF

	curl_put '/drives/1' <<EOF
{
  "drive_id": "1",
  "path_on_host": "$FC_ROOTFS",
  "is_root_device": true,
  "is_read_only": false
}
EOF

	curl_put '/vsock' <<EOF
{
  "guest_cid": 3,
  "uds_path": "$VM_AGENT_SOCKET"
}
EOF

	curl_put '/network-interfaces/eth0' <<EOF
{
  "iface_id": "eth0",
  "guest_mac": "$FC_MAC",
  "host_dev_name": "$TAP_DEV"
}
EOF

}

start_microvm() {
	curl_put '/actions' <<EOF
{
  "action_type": "InstanceStart"
}
EOF
}

setup_microvm() {
	# Wait for firecracker API server to start
	while [ ! -e "$FC_SOCKET" ]; do
		sleep 0.01s
	done

	configure_microvm

	start_microvm
}

######################################## MAIN SCRIPT ########################################

ensure_kernel

build_vm_agent

build_vm_node_helper

create_rootfs

setup_microvm &

start_firecracker
