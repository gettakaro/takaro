import Firecracker from '../index';
import { config } from '../../../config';

console.debug(config.get('firecracker.binary'));
console.debug(config.get('firecracker.rootfs'));

const firecracker = new Firecracker({
  binary: config.get('firecracker.binary'),
  kernelImage: config.get('firecracker.kernelImage'),
  rootfs: config.get('firecracker.rootfs'),
  fcSocket: config.get('firecracker.socket'),
  agentSocket: config.get('firecracker.agentSocket'),
});

firecracker
  .startVM()
  .then(() => {})
  .catch((err) => console.log(err));
