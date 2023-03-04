#!/bin/bash

set -euom pipefail

FC_ROOTFS="$PWD/firecracker/rootfs.ext4"
FC_KERNEL="$PWD/firecracker/vmlinux.bin"

# FC_KERNEL_BOOT_ARGS="init=/sbin/boottime_init panic=1 pci=off nomodules reboot=k tsc=reliable quiet i8042.nokbd i8042.noaux 8250.nr_uarts=0 ipv6.disable=1"
#
FC_KERNEL_BOOT_ARGS="ro console=ttyS0 noapic reboot=k panic=1 pci=off nomodules random.trust_cpu=on"

FC_MAC="02:FC:00:00:00:05"
TAP_DEV="fc-tap0"

FC_SOCKET="/tmp/takaro/firecracker.socket"
FC_LOGFILE="$PWD/firecracker/logs.fifo"
FC_METRICS="$PWD/firecracker/metrics.fifo"

VM_AGENT_BINARY="$PWD/packages/vm-agent/target/x86_64-unknown-linux-musl/debug/vm-agent"
VM_AGENT_SERVICE="$PWD/packages/vm-agent/agent-service"
VM_AGENT_IMAGE_BUILD_SCRIPT="$PWD/containers/vm-agent-image/build.sh"
VM_AGENT_SOCKET="/tmp/takaro/agent.socket"

CURL=(curl --silent --show-error --header "Content-Type: application/json" --unix-socket "${FC_SOCKET}" --write-out "HTTP %{http_code}")

curl_put() {
	local URL_PATH="$1"
	local OUTPUT RC
	OUTPUT="$("${CURL[@]}" -X PUT --data @- "http://localhost/${URL_PATH#/}" 2>&1)"
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
		alpine sh <"$VM_AGENT_IMAGE_BUILD_SCRIPT"

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

build_vm_agent

create_rootfs

setup_microvm &

start_firecracker
