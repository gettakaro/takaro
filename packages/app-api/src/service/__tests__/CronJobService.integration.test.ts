import { IntegrationTest, expect } from '@takaro/test';
import { GameServerOutputDTO, ModuleOutputDTO, CronJobOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { queueService } from '../../workers/QueueService.js';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';
const group = 'CronJobService';

interface IStandardSetupData {
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  installation: ModuleInstallationOutputDTO;
  cronjob: CronJobOutputDTO;
  mockservers: Awaited<ReturnType<typeof getMockServer>>[];
}

function getJobKey(
  modInstallation: ModuleInstallationOutputDTO | { gameserverId: string },
  cronJob: CronJobOutputDTO | { id: string },
) {
  return `${modInstallation.gameserverId}-${cronJob.id}`;
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

  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
  const identityToken = randomUUID();
  const mockServer = await getMockServer({
    mockserver: {
      registrationToken: this.domainRegistrationToken,
      identityToken,
    },
  });

  const gameServerRes = (
    await this.client.gameserver.gameServerControllerSearch({
      filters: { identityToken: [identityToken] },
    })
  ).data.data;
  const gameserver = gameServerRes.find((gs) => gs.identityToken === identityToken);
  if (!gameserver) throw new Error('Game server not found. Did something fail when registering?');

  const installation = (
    await this.client.module.moduleInstallationsControllerInstallModule({
      gameServerId: gameserver.id,
      versionId: mod.latestVersion.id,
    })
  ).data.data;

  if (!this.standardDomainId) throw new Error('No standard domain id set!');

  return {
    mod,
    gameserver,
    installation,
    cronjob,
    mockservers: [mockServer],
  };
}

const tests = [
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Installing a module enables cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { gameserver, mod, installation: assignment, cronjob } = this.setupData;

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: gameserver.id,
        versionId: mod.latestVersion.id,
      });

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return job.key === getJobKey(assignment, mod.latestVersion.cronJobs[0]);
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
      const { mod, installation: assignment } = this.setupData;

      await this.client.module.moduleInstallationsControllerUninstallModule(
        assignment.moduleId,
        assignment.gameserverId,
      );

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return job.key === getJobKey(assignment, mod.latestVersion.cronJobs[0]);
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
      const { mod, installation: assignment } = this.setupData;

      await this.adminClient.domain.domainControllerRemove(this.standardDomainId as string);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return job.key === getJobKey(assignment, mod.latestVersion.cronJobs[0]);
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
      const { mod, installation: assignment } = this.setupData;

      await this.client.module.moduleControllerRemove(mod.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return job.key === getJobKey(assignment, mod.latestVersion.cronJobs[0]);
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
      const { mod, installation: assignment, gameserver } = this.setupData;

      await this.client.gameserver.gameServerControllerRemove(gameserver.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return job.key === getJobKey(assignment, mod.latestVersion.cronJobs[0]);
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
