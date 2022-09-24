import { TakaroService } from './Base';
import { QueuesService } from '@takaro/queues';

import { CronJobModel, CronJobRepo } from '../db/cronjob';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { AuthService } from './AuthService';
import {
  AssignFunctionDTO,
  FunctionOutputDTO,
  FunctionService,
} from './FunctionService';
import { Type } from 'class-transformer';

export class CronJobOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  functions: FunctionOutputDTO[] = [];
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

  @IsUUID()
  moduleId!: string;
}

export class UpdateCronJobDTO {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  temporalValue!: string;

  @IsUUID()
  @IsOptional()
  moduleId?: string;
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

  async assign(data: AssignFunctionDTO) {
    const functionsService = new FunctionService(this.domainId);
    await functionsService.assign(data);
    const cron = await this.repo.findOne(data.itemId);
    await this.removeCronFromQueue(data.itemId);
    await this.addCronToQueue(cron);
    return cron;
  }

  async unAssign(itemId: string, functionId: string) {
    const functionsService = new FunctionService(this.domainId);
    await functionsService.unAssign(itemId, functionId);
    const cron = await this.repo.findOne(itemId);
    await this.removeCronFromQueue(itemId);
    await this.addCronToQueue(cron);
    return cron;
  }

  private getRepeatableOpts(item: CronJobModel) {
    return {
      pattern: item.temporalValue,
      jobId: item.id,
    };
  }

  private async addCronToQueue(item: CronJobModel) {
    const authService = new AuthService(this.domainId);
    const functionsService = new FunctionService(this.domainId);

    const relatedFunctions = await functionsService.getRelatedFunctions(
      item.id,
      true
    );

    await this.queues.queues.cronjobs.queue.add(
      item.id,
      {
        functions: relatedFunctions as string[],
        domainId: this.domainId,
        token: await authService.getAgentToken(),
        itemId: item.id,
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
