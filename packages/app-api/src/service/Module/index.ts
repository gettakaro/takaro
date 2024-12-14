import { TakaroService } from '../Base.js';

import { ModuleModel, ModuleRepo } from '../../db/module.js';

import { CronJobCreateDTO, CronJobService } from '../CronJobService.js';
import { HookCreateDTO, HookService } from '../HookService.js';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { CommandCreateDTO, CommandService } from '../CommandService.js';
import {
  BuiltinModule,
  TakaroEventModuleCreated,
  TakaroEventModuleUpdated,
  TakaroEventModuleDeleted,
  getModules,
  TakaroEventModuleInstalled,
  TakaroEventModuleUninstalled,
} from '@takaro/modules';
import { PermissionCreateDTO, PermissionOutputDTO } from '../RoleService.js';

// Curse you ESM... :(
import _Ajv from 'ajv';
import { getEmptyConfigSchema, getSystemConfigSchema } from '../../lib/systemConfig.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../EventService.js';
import { FunctionCreateDTO, FunctionService } from '../FunctionService.js';
import {
  InstallModuleDTO,
  ModuleCreateAPIDTO,
  ModuleCreateDTO,
  ModuleCreateInternalDTO,
  ModuleInstallationOutputDTO,
  ModuleOutputDTO,
  ModuleUpdateDTO,
  ModuleVersionOutputDTO,
  ModuleVersionUpdateDTO,
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

  private async addLatestVersion(mod: ModuleOutputDTO) {
    const latestVersion = await this.getLatestVersion(mod.id);
    mod.latestVersion = latestVersion;
    return mod;
  }

  async find(filters: ITakaroQuery<ModuleOutputDTO>): Promise<PaginatedOutput<ModuleOutputDTO>> {
    const results = await this.repo.find(filters);

    return {
      total: results.total,
      results: await Promise.all(results.results.map((m) => this.addLatestVersion(m))),
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
    return result ? this.addLatestVersion(result) : undefined;
  }

  async findOneVersion(id: string): Promise<ModuleVersionOutputDTO | undefined> {
    return this.repo.findOneVersion(id);
  }

  async findOneInstallation(id: string) {
    return this.repo.findOneInstallation(id);
  }

  async create(_mod: ModuleCreateDTO): Promise<ModuleOutputDTO> {
    // Use the init() method instead
    throw new errors.NotImplementedError();
  }

  async init(mod: ModuleCreateAPIDTO): Promise<ModuleOutputDTO> {
    try {
      if (!mod.configSchema) {
        mod.configSchema = JSON.stringify(getEmptyConfigSchema());
      }
      ajv.compile(JSON.parse(mod.configSchema));
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
        description: mod.description,
        configSchema: mod.configSchema,
        uiSchema: mod.uiSchema,
        permissions: await Promise.all(
          (mod.permissions ?? []).map((p) => new PermissionCreateDTO({ ...p, canHaveCount: p.canHaveCount ?? false })),
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
    try {
      const updated = await this.repo.update(id, mod);

      if (!updated.builtin) {
        await this.eventsService().create(
          new EventCreateDTO({
            eventName: EVENT_TYPES.MODULE_UPDATED,
            moduleId: id,
            meta: new TakaroEventModuleUpdated(),
          }),
        );
      }

      return updated;
    } catch {
      throw new errors.BadRequestError('Invalid config schema');
    }
  }

  async updateVersion(id: string, mod: ModuleVersionUpdateDTO) {
    try {
      const updated = await this.repo.updateVersion(id, mod);
      return updated;
    } catch {
      throw new errors.BadRequestError('Invalid config schema');
    }
  }

  async delete(id: string) {
    const installations = await this.findInstallations({
      filters: {
        moduleId: [id],
      },
    });
    await Promise.all(installations.results.map((i) => this.uninstallModule(i.id)));
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

  async deleteVersion(id: string) {
    return this.repo.deleteVersion(id);
  }

  async import(mod: BuiltinModule<unknown>) {
    const existing = await this.repo.find({
      filters: { name: [mod.name] },
    });

    if (existing.results.length === 1) {
      mod.name = `${mod.name}-imported`;
    }

    return this.seedModule(mod, true);
  }

  async seedBuiltinModules() {
    const modules = getModules();
    await Promise.all(modules.map((m) => this.seedModule(m)));
  }

  async seedModule(builtin: BuiltinModule<unknown>, isImport = false) {
    const existingModule = await this.repo.find({
      filters: { builtin: [builtin.name] },
    });

    let mod = existingModule.results[0];

    // New module, create it
    if (!mod) {
      this.log.info(`Creating new module ${builtin.name}`, { name: builtin.name });
      mod = await this.init(
        new ModuleCreateInternalDTO({
          name: builtin.name,
          description: builtin.description,
          configSchema: builtin.configSchema,
          uiSchema: builtin.uiSchema,
          builtin: isImport ? null : builtin.name,
          permissions: await Promise.all(builtin.permissions.map((p) => new PermissionOutputDTO(p))),
        }),
      );
    }

    const existingVersionRes = await this.findVersions({ filters: { version: [builtin.version], moduleId: [mod.id] } });

    const existingVersions = existingVersionRes.results.filter((v) => v.tag === builtin.version);

    // Version already exists, no action needed
    if (existingVersions.length) return;

    const latestVersion = await this.getLatestVersion(mod.id);

    this.log.info(`Creating new module version ${builtin.name}-${builtin.version}`, {
      name: builtin.name,
      version: builtin.version,
    });
    const commands = Promise.all(
      builtin.commands.map(async (c) => {
        const data = new CommandCreateDTO({
          ...c,
          versionId: latestVersion.id,
        });
        return this.commandService().create(data);
      }),
    );

    const hooks = Promise.all(
      builtin.hooks.map(async (h) => {
        const data = new HookCreateDTO({
          ...h,
          eventType: h.eventType,
          versionId: latestVersion.id,
        });
        return this.hookService().create(data);
      }),
    );
    const cronjobs = Promise.all(
      builtin.cronJobs.map(async (c) => {
        const data = new CronJobCreateDTO({
          ...c,
          versionId: latestVersion.id,
        });
        return this.cronjobService().create(data);
      }),
    );

    const functions = Promise.all(
      builtin.functions.map(async (f) => {
        const data = new FunctionCreateDTO({
          name: f.name,
          code: f.function,
          versionId: latestVersion.id,
        });
        return this.functionService().create(data);
      }),
    );
    await Promise.all([commands, hooks, cronjobs, commands, functions]);

    // With everything in place, we can now create the version
    await this.tagVersion(mod.id, builtin.version);
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
  async tagVersion(moduleId: string, version: string) {
    const newVersion = await this.repo.createVersion(moduleId, version);
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

  async uninstallModule(installationId: string) {
    const installation = await this.repo.findOneInstallation(installationId);
    await this.cronjobService().uninstallCronJobs(installation);
    await this.repo.uninstallModule(installationId);
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
        await this.uninstallModule(installation.id);
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
