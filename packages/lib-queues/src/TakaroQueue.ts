import { getRedisConnectionOptions } from './util/redisConnectionOptions.js';
import { JobsOptions, Queue } from 'bullmq';
import { createHash } from 'crypto';
import { logger } from '@takaro/util';

export class TakaroQueue<T extends Record<string, unknown>> {
  public bullQueue: Queue<T>;
  private log = logger('TakaroQueue');

  constructor(public name: string) {
    this.bullQueue = new Queue(name, {
      connection: getRedisConnectionOptions(),
    });
  }

  /**
   * Generating a job ID like this effectively de-duplicates all jobs with the same data.
   * @see https://docs.bullmq.io/guide/jobs/job-ids
   * @param data
   * @returns
   */
  private getJobId(data: T) {
    const hash = createHash('sha1').update(JSON.stringify(data)).digest('base64');
    return hash;
  }

  add(data: T, extra: JobsOptions = {}, name = this.name) {
    const jobId = extra.jobId ?? this.getJobId(data);
    const isRepeatable = extra.repeat ? true : false;
    this.log.debug(`Adding job ${jobId} to queue ${name}`);
    if (isRepeatable) {
      return this.bullQueue.add(name, data, extra);
    } else {
      return this.bullQueue.add(name, data, { jobId, ...extra });
    }
  }

  getRepeatableJobs() {
    return this.bullQueue.getRepeatableJobs();
  }

  removeRepeatableByKey(id: string) {
    return this.bullQueue.removeRepeatableByKey(id);
  }
}
