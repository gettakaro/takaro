import Firecracker from '../index';
import { config } from '../../../config';

const firecracker = new Firecracker({
  binary: config.get('firecracker.binary'),
  kernelImage: config.get('firecracker.kernelImage'),
  rootfs: config.get('firecracker.rootfs'),
  fcSocket: config.get('firecracker.socket'),
  agentSocket: config.get('firecracker.agentSocket'),
});

firecracker
  .createVM()
  .then(() => {})
  .catch((err) => console.log(err));
