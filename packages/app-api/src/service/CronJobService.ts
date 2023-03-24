import { TakaroService } from './Base.js';
import { QueuesService } from '@takaro/queues';

import { CronJobModel, CronJobRepo } from '../db/cronjob.js';
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
  FunctionUpdateDTO,
} from './FunctionService.js';
import { Type } from 'class-transformer';
import { TakaroDTO, errors, TakaroModelDTO } from '@takaro/util';
import { PaginatedOutput } from '../db/base.js';
import { ITakaroQuery } from '@takaro/db';

export class CronJobOutputDTO extends TakaroModelDTO<CronJobOutputDTO> {
  @IsString()
  name!: string;

  @IsString()
  temporalValue!: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  function: FunctionOutputDTO;

  @IsUUID()
  moduleId: string;
}

export class CronJobCreateDTO extends TakaroDTO<CronJobCreateDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;

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
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  temporalValue!: string;

  @IsOptional()
  @IsString()
  function: string;
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
      const newFn = await functionsService.create(
        await new FunctionCreateDTO().construct({
          code: item.function,
        })
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(
        await new FunctionCreateDTO().construct({
          code: '',
        })
      );
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(
      await new CronJobCreateDTO().construct({ ...item, function: fnIdToAdd })
    );
    await this.addCronToQueue(created);
    return created;
  }
  async update(id: string, item: CronJobUpdateDTO) {
    const existing = await this.repo.findOne(id);

    if (!existing) {
      throw new errors.NotFoundError('Cronjob not found');
    }

    if (item.function) {
      const functionsService = new FunctionService(this.domainId);
      const fn = await functionsService.findOne(existing.function.id);
      if (!fn) {
        throw new errors.NotFoundError('Function not found');
      }

      await functionsService.update(
        fn.id,
        await new FunctionUpdateDTO().construct({
          code: item.function,
        })
      );
    }

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
        function: item.function.code,
        domainId: this.domainId,
        itemId: item.id,
        gameServerId: 'any',
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
