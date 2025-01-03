import { TakaroService } from '../Base.js';

import { ModuleModel, ModuleRepo } from '../../db/module.js';

import { CronJobCreateDTO, CronJobService, CronJobUpdateDTO } from '../CronJobService.js';
import { HookCreateDTO, HookService } from '../HookService.js';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroQuery, SortDirection } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { CommandCreateDTO, CommandService } from '../CommandService.js';
import {
  ModuleTransferDTO,
  TakaroEventModuleCreated,
  TakaroEventModuleUpdated,
  TakaroEventModuleDeleted,
  TakaroEventModuleInstalled,
  TakaroEventModuleUninstalled,
  getModules,
} from '@takaro/modules';
import { PermissionCreateDTO } from '../RoleService.js';
import * as semver from 'semver';

// Curse you ESM... :(
import _Ajv from 'ajv';
import { getEmptyConfigSchema, getEmptyUiSchema, getSystemConfigSchema } from '../../lib/systemConfig.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../EventService.js';
import { FunctionCreateDTO, FunctionService, FunctionUpdateDTO } from '../FunctionService.js';
import {
  InstallModuleDTO,
  ModuleCreateAPIDTO,
  ModuleCreateDTO,
  ModuleCreateInternalDTO,
  ModuleCreateVersionInputDTO,
  ModuleInstallationOutputDTO,
  ModuleOutputDTO,
  ModuleUpdateDTO,
  ModuleVersionOutputDTO,
  ModuleVersionUpdateDTO,
  SmallModuleVersionOutputDTO,
} from './dto.js';

const Ajv = _Ajv as unknown as typeof _Ajv.default;
const ajv = new Ajv({ useDefaults: true, strict: true, allErrors: true });

// Since input types have undistinguishable schemas. We need an annotation to parse into the correct input type.
// E.g. a select and country input both have an enum schema, to distinguish them we use the x-component: 'country'.
ajv.addKeyword('x-component');

@traceableClass('service:module')
export class ModuleService extends TakaroService<ModuleModel, ModuleOutputDTO, ModuleCreateDTO, ModuleUpdateDTO> {
  commandService = () => new CommandService(this.domainId);
  hookService = () => new HookService(this.domainId);
  cronjobService = () => new CronJobService(this.domainId);
  functionService = () => new FunctionService(this.domainId);
  eventsService = () => new EventService(this.domainId);

  get repo() {
    return new ModuleRepo(this.domainId);
  }

  private async extendModuleDTO(mod: ModuleOutputDTO): Promise<ModuleOutputDTO> {
    const latestVersion = await this.getLatestVersion(mod.id);
    mod.latestVersion = latestVersion;

    mod.versions = (
      await this.repo.findVersions({
        filters: {
          moduleId: [mod.id],
        },
        sortBy: 'updatedAt',
        sortDirection: SortDirection.desc,
      })
    ).results.map(
      (v) =>
        new SmallModuleVersionOutputDTO({
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          id: v.id,
          tag: v.tag,
        }),
    );
    return mod;
  }

  async find(filters: ITakaroQuery<ModuleOutputDTO>): Promise<PaginatedOutput<ModuleOutputDTO>> {
    const results = await this.repo.find(filters);

    return {
      total: results.total,
      results: await Promise.all(results.results.map((m) => this.extendModuleDTO(m))),
    };
  }

  async findVersions(filters: ITakaroQuery<ModuleVersionOutputDTO>): Promise<PaginatedOutput<ModuleVersionOutputDTO>> {
    return this.repo.findVersions(filters);
  }

  async findInstallations(
    filters: ITakaroQuery<ModuleInstallationOutputDTO>,
  ): Promise<PaginatedOutput<ModuleInstallationOutputDTO>> {
    return this.repo.findInstallations(filters);
  }

  async findOne(id: string): Promise<ModuleOutputDTO | undefined> {
    const result = await this.repo.findOne(id);
    return result ? this.extendModuleDTO(result) : undefined;
  }

  async findOneVersion(id: string): Promise<ModuleVersionOutputDTO | undefined> {
    return this.repo.findOneVersion(id);
  }

  async findOneInstallation(gameServerId: string, moduleId: string) {
    return this.repo.findOneInstallation(gameServerId, moduleId);
  }

  async create(_mod: ModuleCreateDTO): Promise<ModuleOutputDTO> {
    // Use the init() method instead
    throw new errors.NotImplementedError();
  }

  async init(mod: ModuleCreateAPIDTO): Promise<ModuleOutputDTO> {
    try {
      if (!mod.latestVersion) {
        mod.latestVersion = new ModuleCreateVersionInputDTO({
          configSchema: JSON.stringify(getEmptyConfigSchema()),
          uiSchema: JSON.stringify(getEmptyUiSchema()),
        });
      }
      if (!mod.latestVersion.configSchema) {
        mod.latestVersion.configSchema = JSON.stringify(getEmptyConfigSchema());
      }
      if (!mod.latestVersion.uiSchema) {
        mod.latestVersion.uiSchema = JSON.stringify(getEmptyUiSchema());
      }
      ajv.compile(JSON.parse(mod.latestVersion.configSchema));
    } catch (e) {
      this.log.warn('Invalid config schema', { error: JSON.stringify(e) });
      throw new errors.BadRequestError('Invalid config schema');
    }

    const created = await this.repo.create(new ModuleCreateInternalDTO(mod));
    // This ensures that there is a 'latest' version
    const version = await this.getLatestVersion(created.id);

    await this.repo.updateVersion(
      version.id,
      new ModuleVersionUpdateDTO({
        description: mod.latestVersion?.description,
        configSchema: mod.latestVersion.configSchema,
        uiSchema: mod.latestVersion.uiSchema,
        permissions: await Promise.all(
          (mod.latestVersion.permissions ?? []).map(
            (p) => new PermissionCreateDTO({ ...p, canHaveCount: p.canHaveCount ?? false }),
          ),
        ),
      }),
    );

    await this.eventsService().create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.MODULE_CREATED,
        moduleId: created.id,
        meta: new TakaroEventModuleCreated(),
      }),
    );

    const res = await this.findOne(created.id);
    if (!res) {
      this.log.error('Failed to find module after creation', { moduleId: created.id });
      throw new errors.InternalServerError();
    }
    return res;
  }

  async update(id: string, mod: ModuleUpdateDTO) {
    const updated = await this.repo.update(id, new ModuleUpdateDTO({ ...mod, latestVersion: undefined }));
    if (mod.latestVersion) {
      const latestVersion = await this.getLatestVersion(id);
      await this.repo.updateVersion(latestVersion.id, mod.latestVersion);
    }

    if (!updated.builtin) {
      await this.eventsService().create(
        new EventCreateDTO({
          eventName: EVENT_TYPES.MODULE_UPDATED,
          moduleId: id,
          meta: new TakaroEventModuleUpdated(),
        }),
      );
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const installations = await this.findInstallations({
      filters: {
        moduleId: [id],
      },
    });
    await Promise.all(installations.results.map((i) => this.uninstallModule(i.gameserverId, i.moduleId)));
    await this.repo.delete(id);

    await this.eventsService().create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.MODULE_DELETED,
        moduleId: id,
        meta: new TakaroEventModuleDeleted(),
      }),
    );

    return id;
  }

  async import(mod: ModuleTransferDTO<unknown>) {
    const existing = await this.repo.find({
      filters: { name: [mod.name] },
    });

    if (existing.results.length === 1) {
      mod.name = `${mod.name}-imported`;
    }

    return this.seedModule(mod, { isBuiltin: false });
  }

  async seedBuiltinModules() {
    const modules = getModules();
    await Promise.all(modules.map((m: ModuleTransferDTO<unknown>) => this.seedModule(m, { isBuiltin: true })));
  }

  async seedModule(data: ModuleTransferDTO<unknown>, { isBuiltin } = { isBuiltin: false }) {
    const existingModule = await this.repo.find({
      filters: { builtin: [data.name] },
    });

    let mod = existingModule.results[0];

    // New module, create it
    if (!mod) {
      this.log.info(`Creating new module ${data.name}`, { name: data.name });
      mod = await this.init(
        new ModuleCreateInternalDTO({
          name: data.name,
          builtin: isBuiltin ? data.name : null,
        }),
      );
    }

    for (const version of data.versions) {
      this.log.info(`Creating new module version ${data.name}-${version.tag}`, {
        name: data.name,
        tag: version.tag,
      });

      const existingVersionRes = await this.findVersions({ filters: { tag: [version.tag], moduleId: [mod.id] } });
      const existingVersions = existingVersionRes.results.filter((v) => v.tag === version.tag);

      // Version already exists,
      // If not builtin -> skip - We will never replace user-created versions
      // If builtin and in dev mode -> replace - This provides hot-reload for builtin modules
      // If builtin and in prod -> throw - We will never replace versions in prod, we should be incrementing the version
      if (existingVersions.length) {
        if (!isBuiltin) {
          this.log.info('Version already exists, skipping', { moduleId: mod.id, tag: version.tag });
          continue;
        }

        if (process.env.NODE_ENV === 'development') {
          this.log.info('Version already exists, replacing', { moduleId: mod.id, tag: version.tag });
          await this.repo.deleteVersion(existingVersions[0].id);
        }

        if (process.env.NODE_ENV === 'production') {
          this.log.error('Version already exists, cannot replace in production', {
            moduleId: mod.id,
            tag: version.tag,
          });
          throw new errors.InternalServerError();
        }
      }

      const latestVersion = await this.getLatestVersion(mod.id);

      const commands = Promise.all(
        (version.commands || []).map(async (c) => {
          const existing = await this.commandService().find({
            filters: { name: [c.name], versionId: [latestVersion.id] },
          });
          const data = new CommandCreateDTO({
            ...c,
            versionId: latestVersion.id,
          });
          if (existing.results.length) {
            return this.commandService().update(existing.results[0].id, data);
          } else {
            return this.commandService().create(data);
          }
        }),
      );

      const hooks = Promise.all(
        (version.hooks || []).map(async (h) => {
          const existing = await this.hookService().find({
            filters: { name: [h.name], versionId: [latestVersion.id] },
          });
          const data = new HookCreateDTO({
            ...h,
            versionId: latestVersion.id,
          });
          if (existing.results.length) {
            return this.hookService().update(existing.results[0].id, data);
          } else {
            return this.hookService().create(data);
          }
        }),
      );

      const cronjobs = Promise.all(
        (version.cronJobs || []).map(async (c) => {
          const existing = await this.cronjobService().find({
            filters: { name: [c.name], versionId: [latestVersion.id] },
          });
          const data = new CronJobCreateDTO({
            ...c,
            versionId: latestVersion.id,
          });
          if (existing.results.length) {
            return this.cronjobService().update(
              existing.results[0].id,
              new CronJobUpdateDTO({
                function: data.function,
                name: data.name,
                temporalValue: data.temporalValue,
              }),
            );
          } else {
            return this.cronjobService().create(data);
          }
        }),
      );

      const functions = Promise.all(
        (version.functions || []).map(async (f) => {
          const existing = await this.functionService().find({
            filters: { name: [f.name], versionId: [latestVersion.id] },
          });
          const data = new FunctionCreateDTO({
            name: f.name,
            code: f.function,
            versionId: latestVersion.id,
          });
          if (existing.results.length) {
            return this.functionService().update(
              existing.results[0].id,
              new FunctionUpdateDTO({
                code: data.code,
                name: data.name,
              }),
            );
          } else {
            return this.functionService().create(data);
          }
        }),
      );

      await Promise.all([commands, hooks, cronjobs, functions]);

      await this.update(
        mod.id,
        new ModuleUpdateDTO({
          latestVersion: new ModuleVersionUpdateDTO({
            configSchema: version.configSchema,
            description: version.description,
            uiSchema: version.uiSchema,
            permissions: (version.permissions as PermissionCreateDTO[]) || [],
          }),
        }),
      );

      // With everything in place, we can now create the version
      await this.tagVersion(mod.id, version.tag);
    }
  }

  async findOneBy(itemType: string, itemId: string | undefined): Promise<ModuleVersionOutputDTO | undefined> {
    if (!itemId) {
      return;
    }

    switch (itemType) {
      case 'cronjob':
        return await this.repo.findByCronJob(itemId);

      case 'command':
        return await this.repo.findByCommand(itemId);

      case 'hook':
        return await this.repo.findByHook(itemId);

      case 'function':
        return await this.repo.findByFunction(itemId);
    }
  }

  async getLatestVersion(moduleId: string) {
    return this.repo.getLatestVersion(moduleId);
  }

  /**
   * Create a new version record and link all the components from 'latest' version to the new version.
   */
  async tagVersion(moduleId: string, tag: string) {
    if (!semver.valid(tag))
      throw new errors.BadRequestError('Invalid version tag, please use semver. Eg 1.0.0 or 2.0.4');

    const newVersion = await this.repo.createVersion(moduleId, tag);
    const latestVersion = await this.getLatestVersion(moduleId);

    const commands = await this.commandService().find({ filters: { versionId: [latestVersion.id] } });
    const hooks = await this.hookService().find({ filters: { versionId: [latestVersion.id] } });
    const cronjobs = await this.cronjobService().find({ filters: { versionId: [latestVersion.id] } });
    const functions = await this.functionService().find({ filters: { versionId: [latestVersion.id] } });

    const commandPromises = commands.results.map((c) =>
      this.commandService().create(
        new CommandCreateDTO({
          versionId: newVersion.id,
          function: c.function.code,
          arguments: c.arguments,
          helpText: c.helpText,
          name: c.name,
          trigger: c.trigger,
        }),
      ),
    );
    const hookPromises = hooks.results.map((h) =>
      this.hookService().create(
        new HookCreateDTO({
          versionId: newVersion.id,
          function: h.function.code,
          eventType: h.eventType,
          name: h.name,
          regex: h.regex,
        }),
      ),
    );
    const cronjobPromises = cronjobs.results.map((c) =>
      this.cronjobService().create(
        new CronJobCreateDTO({
          versionId: newVersion.id,
          function: c.function.code,
          name: c.name,
          temporalValue: c.temporalValue,
        }),
      ),
    );
    const functionPromises = functions.results.map((f) =>
      this.functionService().create(new FunctionCreateDTO({ versionId: newVersion.id, code: f.code, name: f.name })),
    );

    await Promise.all([...commandPromises, ...hookPromises, ...cronjobPromises, ...functionPromises]);

    await this.repo.updateVersion(
      newVersion.id,
      new ModuleVersionUpdateDTO({
        description: latestVersion.description,
        configSchema: latestVersion.configSchema,
        uiSchema: latestVersion.uiSchema,
        permissions: await Promise.all(
          latestVersion.permissions.map(
            (p) => new PermissionCreateDTO({ ...p, canHaveCount: p.canHaveCount ?? false }),
          ),
        ),
      }),
    );

    return this.findOneVersion(newVersion.id);
  }

  async installModule(installDto: InstallModuleDTO) {
    const versionToInstall = await this.findOneVersion(installDto.versionId);
    if (!versionToInstall) throw new errors.NotFoundError('Version not found');
    const mod = await this.findOne(versionToInstall.moduleId);
    if (!mod) throw new errors.NotFoundError('Module not found');
    if (!installDto.userConfig) installDto.userConfig = '{}';
    if (!installDto.systemConfig) installDto.systemConfig = '{}';

    const modUserConfig = JSON.parse(installDto.userConfig);
    const validateUserConfig = ajv.compile(JSON.parse(versionToInstall.configSchema));
    const isValidUserConfig = validateUserConfig(modUserConfig);

    const modSystemConfig = JSON.parse(installDto.systemConfig);
    const validateSystemConfig = ajv.compile(JSON.parse(getSystemConfigSchema(versionToInstall)));
    const isValidSystemConfig = validateSystemConfig(modSystemConfig);

    if (!isValidUserConfig || !isValidSystemConfig) {
      const allErrors = [...(validateSystemConfig.errors ?? []), ...(validateUserConfig.errors ?? [])];
      const prettyErrors = allErrors
        .map((e) => {
          if (e.keyword === 'additionalProperties') {
            return `${e.message}, invalid: ${e.params.additionalProperty}`;
          }

          return `${e.instancePath} ${e.message}`;
        })
        .join(', ');
      throw new errors.BadRequestError(`Invalid config: ${prettyErrors}`);
    }

    // ajv mutates the object, so we need to stringify it again
    installDto.userConfig = JSON.stringify(modUserConfig);
    installDto.systemConfig = JSON.stringify(modSystemConfig);

    // If this module is already installed, we'll uninstall it first
    const existingInstallation = await this.getInstalledModules({
      gameserverId: installDto.gameServerId,
      moduleId: versionToInstall.moduleId,
    });
    if (existingInstallation.length) {
      await this.uninstallModule(existingInstallation[0].gameserverId, existingInstallation[0].moduleId);
    }

    const installation = await this.repo.installModule(installDto);
    await this.cronjobService().syncModuleCronjobs(installation);

    await this.eventsService().create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.MODULE_INSTALLED,
        gameserverId: installation.gameserverId,
        moduleId: installation.moduleId,
        meta: new TakaroEventModuleInstalled({
          systemConfig: installDto.systemConfig,
          userConfig: installDto.userConfig,
        }),
      }),
    );

    return installation;
  }

  async uninstallModule(gameServerId: string, moduleId: string) {
    const installation = await this.repo.findOneInstallation(gameServerId, moduleId);
    await this.cronjobService().uninstallCronJobs(installation);
    await this.repo.uninstallModule(gameServerId, moduleId);
    await this.eventsService().create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.MODULE_UNINSTALLED,
        gameserverId: installation.gameserverId,
        moduleId: installation.moduleId,
        meta: await new TakaroEventModuleUninstalled(),
      }),
    );

    return installation;
  }

  /**
   * Special helper that AND's all the provided filters
   * @param filters
   * @returns
   */
  async getInstalledModules(filters: { gameserverId?: string; moduleId?: string; versionId?: string }) {
    return this.repo.getInstalledModules(filters);
  }

  /**
   * After creating a hook, command, cronjob or function, the systemConfig may be outdated
   * This method will refresh all installations of a module, updating the systemConfig
   * @param versionId
   */
  async refreshInstallations(versionId: string) {
    const installations = await this.getInstalledModules({ versionId });

    for (const installation of installations) {
      if (installation.version.tag !== 'latest') {
        this.log.error('This should not happen! Everything except "latest" tag is immutable', { versionId });
        throw new errors.BadRequestError('Cannot refresh latest version');
      }
      try {
        await this.uninstallModule(installation.gameserverId, installation.moduleId);
        await this.installModule(
          new InstallModuleDTO({
            gameServerId: installation.gameserverId,
            versionId,
            systemConfig: JSON.stringify(installation.systemConfig),
            userConfig: JSON.stringify(installation.userConfig),
          }),
        );
      } catch (error) {
        if ((error as Error).message === 'Invalid config schema') {
          this.log.warn('Invalid config schema, leaving as-is', {
            versionId,
            gameserverId: installation.gameserverId,
          });
        } else {
          throw error;
        }
      }
    }
  }
}