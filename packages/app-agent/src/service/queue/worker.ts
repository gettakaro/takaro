import { Worker } from 'bullmq';
import { logger } from '@takaro/logger';
import { config } from '../../config';
import { getRedisConnectionOptions } from '../../util/redisConnectionOptions';
import { ImagesService, ContainersService, TasksService } from '@takaro/containerd';


const log = logger('worker');


export const worker = new Worker(config.get('queue.name'), async job => {
  const imageService = new ImagesService(config.get('containerd.socketPath'), config.get('containerd.namespace'));
  const containersService = new ContainersService(config.get('containerd.socketPath'), config.get('containerd.namespace'));
  const tasksService = new TasksService(config.get('containerd.socketPath'), config.get('containerd.namespace'));
  console.log('hierrrrrrrrrrrrrrrrrrrrrrrrrrr');
  const images = await imageService.list({});

  //const container = await containersService.create({ container: { image: 'hello-world', id: 'aaa', runtime: { name: 'io.containerd.runtime.v2' }, spec: { value: 'aa', type_url: 'aa' } } })

  await tasksService.create({ containerId: 'aaa' });

  const containers = await containersService.list({});
  console.log(containers);
  log.warn('images', images);
  const image = await imageService.get({ name: 'hello-world' });



}, { connection: getRedisConnectionOptions() });

worker.on('error', err => {
  // log the error
  log.error(err);
});
