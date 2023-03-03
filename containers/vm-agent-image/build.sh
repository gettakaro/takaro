#!/bin/bash

# THIS SCRIPT SHOULD BE RUN INSIDE THE PROVIDED ALPINE CONTAINER

set -e

# Add required packages
apk add --no-cache openrc     # init system
apk add --no-cache util-linux # required for agetty
apk add --no-cache nodejs npm

# Set up a login terminal on the serial console (ttyS0):
ln -s agetty /etc/init.d/agetty.ttyS0
echo ttyS0 >/etc/securetty
rc-update add agetty.ttyS0 default

# Change root password
echo "root:root" | chpasswd

# Setup dns
echo "nameserver 1.1.1.1" >>/etc/resolv.conf

# Start our agent service on boot
rc-update add agent boot

# Then, copy the newly configured system to the rootfs image:
for d in bin etc lib root sbin usr; do
	tar c "/$d" | tar x -C /my-rootfs
done

# The above command may trigger the following message:
# tar: Removing leading "/" from member names
# However, this is just a warning, so you should be able to
# proceed with the setup process.
for dir in dev proc run sys var tmp; do
	mkdir /my-rootfs/${dir}
done

# All done, exit docker shell.
exit
