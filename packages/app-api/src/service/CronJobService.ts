import { TakaroService } from './Base';
import { QueuesService } from '@takaro/queues';

import { CronJobModel, CronJobRepo } from '../db/cronjob';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CronJobOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;
}

export class CronJobCreateDTO {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsOptional()
  @IsString()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;
}

export class UpdateCronJobDTO {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;
}

export class CronJobService extends TakaroService<CronJobModel> {
  queues = QueuesService.getInstance();

  get repo() {
    return new CronJobRepo(this.domainId);
  }

  async create(item: CronJobCreateDTO) {
    const created = await this.repo.create(item);
    await this.addCronToQueue(created);
    return created;
  }
  async update(id: string, item: UpdateCronJobDTO) {
    await this.removeCronFromQueue(id);
    const updated = await this.repo.update(id, item);
    await this.addCronToQueue(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.removeCronFromQueue(id);
    return this.repo.delete(id);
  }

  private getRepeatableOpts(item: CronJobOutputDTO) {
    return {
      pattern: item.temporalValue,
      jobId: item.id,
    };
  }

  private async addCronToQueue(item: CronJobOutputDTO) {
    await this.queues.queues.cronjobs.queue.add(
      item.id,
      {
        function: {
          code: 'AAAAAAAAAAAAAAAAAA',
        },
        domainId: this.domainId,
      },
      {
        repeat: this.getRepeatableOpts(item),
      }
    );
  }

  private async removeCronFromQueue(id: string) {
    const repeatables =
      await this.queues.queues.cronjobs.queue.getRepeatableJobs();

    const repeatable = repeatables.find((r) => r.id === id);
    if (repeatable) {
      await this.queues.queues.cronjobs.queue.removeRepeatableByKey(
        repeatable.key
      );
    } else {
      this.log.warn(`CronJob ${id} not found in queue when deleting`);
    }
  }
}
