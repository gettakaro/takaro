import { getRedisConnectionOptions } from './util/redisConnectionOptions.js';
import { JobsOptions, Queue } from 'bullmq';
import { createHash } from 'crypto';

export class TakaroQueue<T extends Record<string, unknown>> {
  public bullQueue: Queue<T>;

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

  add(data: T, extra: JobsOptions = {}) {
    const jobId = extra.jobId ?? this.getJobId(data);
    const isRepeatable = extra.repeat ? true : false;
    if (isRepeatable) {
      return this.bullQueue.add(this.name, data, extra);
    } else {
      return this.bullQueue.add(this.name, data, { jobId, ...extra });
    }
  }

  getRepeatableJobs() {
    return this.bullQueue.getRepeatableJobs();
  }

  removeRepeatableByKey(id: string) {
    return this.bullQueue.removeRepeatableByKey(id);
  }
}
