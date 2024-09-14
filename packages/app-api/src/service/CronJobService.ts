import { TakaroService } from './Base.js';
import { queueService } from '@takaro/queues';

import { CronJobModel, CronJobRepo } from '../db/cronjob.js';
import { IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { FunctionCreateDTO, FunctionOutputDTO, FunctionService, FunctionUpdateDTO } from './FunctionService.js';
import { Type } from 'class-transformer';
import { TakaroDTO, errors, TakaroModelDTO, traceableClass } from '@takaro/util';
import { PaginatedOutput } from '../db/base.js';
import { ITakaroQuery } from '@takaro/db';
import { ModuleService } from './ModuleService.js';
import { GameServerService, ModuleInstallationOutputDTO, ModuleInstallDTO } from './GameServerService.js';
import { randomUUID } from 'crypto';

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
  @Length(1, 50)
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
  @Length(1, 50)
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

export class CronJobTriggerDTO extends TakaroDTO<CronJobTriggerDTO> {
  @IsUUID()
  gameServerId: string;

  @IsUUID()
  cronjobId: string;

  @IsUUID()
  moduleId: string;
}

@traceableClass('service:cronjob')
export class CronJobService extends TakaroService<CronJobModel, CronJobOutputDTO, CronJobCreateDTO, CronJobUpdateDTO> {
  get repo() {
    return new CronJobRepo(this.domainId);
  }

  find(filters: ITakaroQuery<CronJobOutputDTO>): Promise<PaginatedOutput<CronJobOutputDTO>> {
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
        new FunctionCreateDTO({
          code: item.function,
        }),
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(await new FunctionCreateDTO());
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(new CronJobCreateDTO({ ...item, function: fnIdToAdd }));

    const moduleService = new ModuleService(this.domainId);
    await moduleService.refreshInstallations(item.moduleId);

    const gameServerService = new GameServerService(this.domainId);
    const installedModules = await gameServerService.getInstalledModules({ moduleId: item.moduleId });
    await Promise.all(installedModules.map((mod) => this.addCronjobToQueue(created, mod)));

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
        new FunctionUpdateDTO({
          code: item.function,
        }),
      );
    }

    const updated = await this.repo.update(id, item);

    const gameServerService = new GameServerService(this.domainId);
    const installedModules = await gameServerService.getInstalledModules({ moduleId: updated.moduleId });
    await Promise.all(
      installedModules.map((i) => {
        const newSystemConfig = i.systemConfig;
        const cmdCfg = newSystemConfig.cronJobs[existing.name];
        delete newSystemConfig.cronJobs[existing.name];
        newSystemConfig.cronJobs[updated.name] = cmdCfg;
        return gameServerService.installModule(
          i.gameserverId,
          i.moduleId,
          new ModuleInstallDTO({
            userConfig: JSON.stringify(i.userConfig),
            systemConfig: JSON.stringify(newSystemConfig),
          }),
        );
      }),
    );

    await Promise.all(installedModules.map((mod) => this.syncModuleCronjobs(mod)));

    return updated;
  }

  async delete(id: string) {
    const existing = await this.repo.findOne(id);

    const gameServerService = new GameServerService(this.domainId);
    const installedModules = await gameServerService.getInstalledModules({ moduleId: existing.moduleId });
    await Promise.all(installedModules.map((mod) => this.removeCronjobFromQueue(existing, mod)));

    await this.repo.delete(id);

    return id;
  }

  public getJobId(modInstallation: ModuleInstallationOutputDTO, cronJob: CronJobOutputDTO) {
    return `${modInstallation.gameserverId}-${cronJob.id}`;
  }

  async syncModuleCronjobs(modInstallation: ModuleInstallationOutputDTO) {
    const mod = await new ModuleService(this.domainId).findOne(modInstallation.moduleId);
    if (!mod) throw new errors.NotFoundError('Module not found');

    await Promise.all(
      mod.cronJobs.map(async (cronJob) => {
        await this.removeCronjobFromQueue(cronJob, modInstallation);
        await this.addCronjobToQueue(cronJob, modInstallation);
      }),
    );
  }

  async installCronJobs(modInstallation: ModuleInstallationOutputDTO) {
    const mod = await new ModuleService(this.domainId).findOne(modInstallation.moduleId);
    if (!mod) throw new errors.NotFoundError('Module not found');

    await Promise.all(
      mod.cronJobs.map(async (cronJob) => {
        await this.addCronjobToQueue(cronJob, modInstallation);
      }),
    );
  }

  async uninstallCronJobs(modInstallation: ModuleInstallationOutputDTO) {
    const mod = await new ModuleService(this.domainId).findOne(modInstallation.moduleId);
    if (!mod) throw new errors.NotFoundError('Module not found');

    await Promise.all(
      mod.cronJobs.map(async (cronJob) => {
        await this.removeCronjobFromQueue(cronJob, modInstallation);
      }),
    );
  }

  private async addCronjobToQueue(cronJob: CronJobOutputDTO, modInstallation: ModuleInstallationOutputDTO) {
    const jobId = this.getJobId(modInstallation, cronJob);
    const systemConfig = modInstallation.systemConfig.cronJobs;

    const gameServerService = new GameServerService(this.domainId);
    const mod = await gameServerService.getModuleInstallation(modInstallation.gameserverId, modInstallation.moduleId);

    if (!mod.systemConfig.enabled) return;
    if (!mod.systemConfig.cronJobs[cronJob.name].enabled) return;

    await queueService.queues.cronjobs.queue.add(
      {
        functionId: cronJob.function.id,
        domainId: this.domainId,
        itemId: cronJob.id,
        gameServerId: modInstallation.gameserverId,
        module: mod,
      },
      {
        repeat: {
          key: jobId,
          pattern: systemConfig
            ? modInstallation.systemConfig.cronJobs[cronJob.name].temporalValue
            : cronJob.temporalValue,
          jobId,
        },
      },
    );
    this.log.debug(`Added repeatable job ${jobId}`);
  }

  private async removeCronjobFromQueue(cronJob: CronJobOutputDTO, modInstallation: ModuleInstallationOutputDTO) {
    const repeatables = await queueService.queues.cronjobs.queue.getRepeatableJobs();
    const jobId = this.getJobId(modInstallation, cronJob);

    const repeatable = repeatables.find((r) => r.key === jobId);
    if (repeatable) {
      await queueService.queues.cronjobs.queue.removeRepeatableByKey(repeatable.key);
      this.log.debug(`Removed repeatable job ${jobId}`);
    }
  }

  async trigger(data: CronJobTriggerDTO) {
    const cronJob = await this.findOne(data.cronjobId);
    if (!cronJob) throw new errors.NotFoundError('Cronjob not found');

    const gameServerService = new GameServerService(this.domainId);
    const modInstallation = await gameServerService.getModuleInstallation(data.gameServerId, data.moduleId);

    await queueService.queues.cronjobs.queue.add({
      functionId: cronJob.function.id,
      domainId: this.domainId,
      itemId: cronJob.id,
      gameServerId: data.gameServerId,
      module: modInstallation,
      // We have some job deduplication logic
      // When manually triggering a cronjob, it will be the exact same each time
      // Putting this random UUID in the data circumvents that
      triggerId: randomUUID(),
    });
  }
}
