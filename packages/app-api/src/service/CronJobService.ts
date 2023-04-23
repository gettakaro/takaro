import { TakaroService } from './Base.js';
import { queueService } from '@takaro/queues';

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
import { ModuleService } from './ModuleService.js';
import { ModuleInstallationOutputDTO } from './GameServerService.js';

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

    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  public getJobId(
    modInstallation: ModuleInstallationOutputDTO,
    cronJob: CronJobOutputDTO
  ) {
    return `${modInstallation.gameserverId}-${cronJob.id}`;
  }

  async syncModuleCronjobs(modInstallation: ModuleInstallationOutputDTO) {
    const mod = await new ModuleService(this.domainId).findOne(
      modInstallation.moduleId
    );
    if (!mod) throw new errors.NotFoundError('Module not found');

    await Promise.all(
      mod.cronJobs.map(async (cronJob) => {
        await this.removeCronjobFromQueue(cronJob, modInstallation);
        await this.addCronjobToQueue(cronJob, modInstallation);
      })
    );
  }

  async installCronJobs(modInstallation: ModuleInstallationOutputDTO) {
    const mod = await new ModuleService(this.domainId).findOne(
      modInstallation.moduleId
    );
    if (!mod) throw new errors.NotFoundError('Module not found');

    await Promise.all(
      mod.cronJobs.map(async (cronJob) => {
        await this.addCronjobToQueue(cronJob, modInstallation);
      })
    );
  }

  async uninstallCronJobs(modInstallation: ModuleInstallationOutputDTO) {
    const mod = await new ModuleService(this.domainId).findOne(
      modInstallation.moduleId
    );
    if (!mod) throw new errors.NotFoundError('Module not found');

    await Promise.all(
      mod.cronJobs.map(async (cronJob) => {
        await this.removeCronjobFromQueue(cronJob, modInstallation);
      })
    );
  }

  private async addCronjobToQueue(
    cronJob: CronJobOutputDTO,
    modInstallation: ModuleInstallationOutputDTO
  ) {
    const jobId = this.getJobId(modInstallation, cronJob);
    await queueService.queues.cronjobs.queue.add(
      {
        function: cronJob.function.code,
        domainId: this.domainId,
        itemId: cronJob.id,
        gameServerId: modInstallation.gameserverId,
      },
      {
        jobId,
        repeat: {
          pattern: modInstallation.systemConfig.cronJobs[cronJob.name],
          jobId,
        },
      }
    );
    this.log.debug(`Added repeatable job ${jobId}`);
  }

  private async removeCronjobFromQueue(
    cronJob: CronJobOutputDTO,
    modInstallation: ModuleInstallationOutputDTO
  ) {
    const repeatables =
      await queueService.queues.cronjobs.queue.getRepeatableJobs();
    const jobId = this.getJobId(modInstallation, cronJob);

    const repeatable = repeatables.find((r) => r.id === jobId);
    if (repeatable) {
      await queueService.queues.cronjobs.queue.removeRepeatableByKey(
        repeatable.key
      );
      this.log.debug(`Removed repeatable job ${jobId}`);
    }
  }
}
