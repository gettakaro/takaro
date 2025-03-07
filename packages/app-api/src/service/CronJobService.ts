import { TakaroService } from './Base.js';
import { queueService } from '@takaro/queues';

import { CronJobModel, CronJobRepo } from '../db/cronjob.js';
import { IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { FunctionCreateDTO, FunctionOutputDTO, FunctionService, FunctionUpdateDTO } from './FunctionService.js';
import { Type } from 'class-transformer';
import { TakaroDTO, errors, TakaroModelDTO, traceableClass } from '@takaro/util';
import { PaginatedOutput } from '../db/base.js';
import { ITakaroQuery } from '@takaro/db';
import { randomUUID } from 'crypto';
import { InstallModuleDTO, ModuleInstallationOutputDTO } from './Module/dto.js';
import { ModuleService } from './Module/index.js';

export class CronJobOutputDTO extends TakaroModelDTO<CronJobOutputDTO> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsString()
  temporalValue!: string;
  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  function: FunctionOutputDTO;
  @IsUUID()
  versionId: string;
}

export class CronJobCreateDTO extends TakaroDTO<CronJobCreateDTO> {
  @IsString()
  @Length(1, 50)
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsString()
  temporalValue!: string;
  @IsUUID()
  versionId: string;
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
  @Length(1, 131072)
  description?: string;
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
  private moduleService = new ModuleService(this.domainId);
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
    const installedModules = await this.moduleService.getInstalledModules({ versionId: item.versionId });
    await Promise.all(installedModules.map((mod) => this.addCronjobToQueue(created, mod)));
    await this.moduleService.refreshInstallations(created.versionId);
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

    const installedModules = await this.moduleService.getInstalledModules({ versionId: updated.versionId });

    await Promise.all(
      installedModules.map((i) => {
        const newSystemConfig = i.systemConfig;
        const cmdCfg = newSystemConfig.cronJobs[existing.name];
        delete newSystemConfig.cronJobs[existing.name];
        newSystemConfig.cronJobs[updated.name] = cmdCfg;
        return this.moduleService.installModule(
          new InstallModuleDTO({
            gameServerId: i.gameserverId,
            versionId: i.versionId,
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
    const installedModules = await this.moduleService.getInstalledModules({ versionId: existing.versionId });
    await Promise.all(installedModules.map((mod) => this.removeCronjobFromQueue(existing, mod)));

    await this.repo.delete(id);

    return id;
  }

  public getJobKey(modInstallation: ModuleInstallationOutputDTO, cronJob: CronJobOutputDTO) {
    return `${modInstallation.gameserverId}-${cronJob.id}`;
  }

  async syncModuleCronjobs(modInstallation: ModuleInstallationOutputDTO) {
    this.log.debug(`Syncing cronjobs for module ${modInstallation.moduleId}`);
    await Promise.all(
      modInstallation.version.cronJobs.map(async (cronJob) => {
        await this.removeCronjobFromQueue(cronJob, modInstallation);
        await this.addCronjobToQueue(cronJob, modInstallation);
      }),
    );
  }

  async installCronJobs(modInstallation: ModuleInstallationOutputDTO) {
    await Promise.all(
      modInstallation.version.cronJobs.map(async (cronJob) => {
        await this.addCronjobToQueue(cronJob, modInstallation);
      }),
    );
  }

  async uninstallCronJobs(modInstallation: ModuleInstallationOutputDTO) {
    await Promise.all(
      modInstallation.version.cronJobs.map(async (cronJob) => {
        await this.removeCronjobFromQueue(cronJob, modInstallation);
      }),
    );
  }

  private async addCronjobToQueue(cronJob: CronJobOutputDTO, modInstallation: ModuleInstallationOutputDTO) {
    const key = this.getJobKey(modInstallation, cronJob);
    const systemConfig = modInstallation.systemConfig.cronJobs;

    if (!modInstallation.systemConfig.enabled) return;
    if (!modInstallation.systemConfig.cronJobs[cronJob.name].enabled) return;

    await queueService.queues.cronjobs.queue.add(
      {
        functionId: cronJob.function.id,
        domainId: this.domainId,
        itemId: cronJob.id,
        gameServerId: modInstallation.gameserverId,
        module: modInstallation,
      },
      {
        repeat: {
          key,
          pattern: systemConfig
            ? modInstallation.systemConfig.cronJobs[cronJob.name].temporalValue
            : cronJob.temporalValue,
        },
      },
    );
    this.log.debug(`Added repeatable job ${key}`);
  }

  private async removeCronjobFromQueue(cronJob: CronJobOutputDTO, modInstallation: ModuleInstallationOutputDTO) {
    const repeatables = await queueService.queues.cronjobs.queue.getRepeatableJobs();
    const key = this.getJobKey(modInstallation, cronJob);

    const repeatable = repeatables.find((r) => r.key === key);
    if (repeatable) {
      await queueService.queues.cronjobs.queue.removeRepeatableByKey(repeatable.key);
      this.log.debug(`Removed repeatable job ${key}`);
    }
  }

  async trigger(data: CronJobTriggerDTO) {
    const cronJob = await this.findOne(data.cronjobId);
    if (!cronJob) throw new errors.NotFoundError('Cronjob not found');

    const modInstallations = await this.moduleService.getInstalledModules({
      gameserverId: data.gameServerId,
      moduleId: data.moduleId,
    });

    await Promise.all(
      modInstallations.map((installation) => {
        return queueService.queues.cronjobs.queue.add({
          functionId: cronJob.function.id,
          domainId: this.domainId,
          itemId: cronJob.id,
          gameServerId: data.gameServerId,
          module: installation,
          // We have some job deduplication logic
          // When manually triggering a cronjob, it will be the exact same each time
          // Putting this random UUID in the data circumvents that
          triggerId: randomUUID(),
        });
      }),
    );
  }
}
