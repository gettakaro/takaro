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
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
} from './FunctionService';
import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/http';
import { PaginatedOutput } from '../db/base';
import { ITakaroQuery } from '@takaro/db';

export class CronJobOutputDTO extends TakaroDTO<CronJobOutputDTO> {
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
  function: FunctionOutputDTO;
}

export class CronJobCreateDTO extends TakaroDTO<CronJobCreateDTO> {
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

  @IsOptional()
  @IsString()
  function?: string;
}

export class CronJobUpdateDTO extends TakaroDTO<CronJobUpdateDTO> {
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

export class CronJobService extends TakaroService<
  CronJobModel,
  CronJobOutputDTO,
  CronJobCreateDTO,
  CronJobUpdateDTO
> {
  queues = QueuesService.getInstance();

  get repo() {
    return new CronJobRepo(this.domainId);
  }

  find(
    filters: ITakaroQuery<CronJobOutputDTO>
  ): Promise<PaginatedOutput<CronJobOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<CronJobOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: CronJobCreateDTO) {
    const functionsService = new FunctionService(this.domainId);
    let fnIdToAdd: string | null = null;

    if (item.function) {
      fnIdToAdd = item.function;
    } else {
      const newFn = await functionsService.create(
        new FunctionCreateDTO({
          code: '',
        })
      );
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(
      new CronJobCreateDTO({ ...item, function: fnIdToAdd })
    );
    await this.addCronToQueue(created);
    return created;
  }
  async update(id: string, item: CronJobUpdateDTO) {
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
    const authService = new AuthService(this.domainId);

    await this.queues.queues.cronjobs.queue.add(
      item.id,
      {
        function: item.function.code,
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
