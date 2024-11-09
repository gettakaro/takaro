import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { GameServerOutputDTO, ModuleOutputDTO, CronJobOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { queueService } from '@takaro/queues';
import { CronJobService, CronJobOutputDTO as ServiceCronJobOutputDTO } from '../CronJobService.js';
import { ModuleInstallationOutputDTO as ServiceModuleInstallationOutputDTO } from '../Module/dto.js';

const group = 'CronJobService';

interface IStandardSetupData {
  service: CronJobService;
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  installation: ModuleInstallationOutputDTO;
  cronjob: CronJobOutputDTO;
}

async function setup(this: IntegrationTest<IStandardSetupData>): Promise<IStandardSetupData> {
  const modCreate = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  const cronjob = (
    await this.client.cronjob.cronJobControllerCreate({
      name: 'Test cronjob',
      versionId: modCreate.latestVersion.id,
      temporalValue: '0 0 * * *',
    })
  ).data.data;

  const mod = (await this.client.module.moduleControllerGetOne(modCreate.id)).data.data;

  const gameserver = (
    await this.client.gameserver.gameServerControllerCreate({
      name: 'Test gameserver',
      type: 'MOCK',
      connectionInfo: JSON.stringify({
        host: integrationConfig.get('mockGameserver.host'),
      }),
    })
  ).data.data;

  const installation = (await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: gameserver.id,
    versionId: mod.latestVersion.id,
  })).data.data;

  if (!this.standardDomainId) throw new Error('No standard domain id set!');

  return {
    service: new CronJobService(this.standardDomainId),
    mod,
    gameserver,
    installation,
    cronjob,
  };
}

const tests = [
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Installing a module enables cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { service, gameserver, mod, installation: assignment, cronjob } = this.setupData;

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: gameserver.id,
        versionId: mod.latestVersion.id
      });

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.key ===
          service.getJobKey(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.latestVersion.cronJobs[0] as ServiceCronJobOutputDTO,
          )
        );
      });

      expect(repeatables).to.have.length(1);
      expect(repeatables[0].pattern).to.equal(
        // @ts-expect-error shortcoming in the generated types... :(
        assignment.systemConfig.cronJobs?.[cronjob.name].temporalValue,
      );
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Uninstalling a module disables cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { service, mod, installation: assignment } = this.setupData;

      await this.client.module.moduleInstallationsControllerUninstallModule(assignment.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.key ===
          service.getJobKey(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.latestVersion.cronJobs[0] as ServiceCronJobOutputDTO,
          )
        );
      });

      expect(repeatables).to.have.length(0);
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Deleting a domain deletes all cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { service, mod, installation: assignment } = this.setupData;

      await this.adminClient.domain.domainControllerRemove(this.standardDomainId as string);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.key ===
          service.getJobKey(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.latestVersion.cronJobs[0] as ServiceCronJobOutputDTO,
          )
        );
      });

      expect(repeatables).to.have.length(0);
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Deleting a module deletes all cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { service, mod, installation: assignment } = this.setupData;

      await this.client.module.moduleControllerRemove(mod.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.key ===
          service.getJobKey(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.latestVersion.cronJobs[0] as ServiceCronJobOutputDTO,
          )
        );
      });

      expect(repeatables).to.have.length(0);
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Deleting a gameserver deletes all cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { service, mod, installation: assignment, gameserver } = this.setupData;

      await this.client.gameserver.gameServerControllerRemove(gameserver.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.key ===
          service.getJobKey(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.latestVersion.cronJobs[0] as ServiceCronJobOutputDTO,
          )
        );
      });

      expect(repeatables).to.have.length(0);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
