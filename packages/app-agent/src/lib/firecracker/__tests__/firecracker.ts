import Firecracker from '../index';

const firecracker = new Firecracker({
  binary: '/home/branco/.local/bin/firecracker',
  kernelImage: '/home/branco/dev/firecracker/hello-vmlinux.bin',
  rootfs: '/home/branco/dev/firecracker/rootfs.ext4',
  fcSocket: '/tmp/firecracker.socket',
  agentSocket: '/tmp/agent.sock',
});

firecracker
  .createVM()
  .then(() => {})
  .catch((err) => console.log(err));
