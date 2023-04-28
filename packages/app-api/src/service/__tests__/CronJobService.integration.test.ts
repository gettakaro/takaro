import { IntegrationTest, expect } from '@takaro/test';
import {
  GameServerOutputDTO,
  ModuleOutputDTO,
  CronJobOutputDTO,
  ModuleInstallationOutputDTO,
} from '@takaro/apiclient';
import { queueService } from '@takaro/queues';
import {
  CronJobService,
  CronJobOutputDTO as ServiceCronJobOutputDTO,
} from '../CronJobService.js';
import { ModuleInstallationOutputDTO as ServiceModuleInstallationOutputDTO } from '../GameServerService.js';

const group = 'CronJobService';

interface IStandardSetupData {
  service: CronJobService;
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  assignment: ModuleInstallationOutputDTO;
  cronjob: CronJobOutputDTO;
}

async function setup(
  this: IntegrationTest<IStandardSetupData>
): Promise<IStandardSetupData> {
  const modCreate = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  const cronjob = (
    await this.client.cronjob.cronJobControllerCreate({
      name: 'Test cronjob',
      moduleId: modCreate.id,
      temporalValue: '0 0 * * *',
    })
  ).data.data;

  const mod = (await this.client.module.moduleControllerGetOne(modCreate.id))
    .data.data;

  const gameserver = (
    await this.client.gameserver.gameServerControllerCreate({
      name: 'Test gameserver',
      type: 'MOCK',
      connectionInfo: '{}',
    })
  ).data.data;

  const assignment = (
    await this.client.gameserver.gameServerControllerInstallModule(
      gameserver.id,
      mod.id,
      {
        userConfig: '{}',
        systemConfig: '{}',
      }
    )
  ).data.data;

  if (!this.standardDomainId) throw new Error('No standard domain id set!');

  return {
    service: new CronJobService(this.standardDomainId),
    mod,
    gameserver,
    assignment,
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
      const { service, gameserver, mod, assignment, cronjob } = this.setupData;

      await this.client.gameserver.gameServerControllerInstallModule(
        gameserver.id,
        mod.id,
        {
          userConfig: '{}',
          systemConfig: '{}',
        }
      );

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.id ===
          service.getJobId(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.cronJobs[0] as ServiceCronJobOutputDTO
          )
        );
      });

      expect(repeatables).to.have.length(1);
      expect(repeatables[0].pattern).to.equal(
        // @ts-expect-error shortcoming in the generated types... :(
        assignment.systemConfig.cronJobs?.[cronjob.name]
      );
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Uninstalling a module disables cron jobs in the queue',
    setup,
    test: async function (this: IntegrationTest<IStandardSetupData>) {
      const { service, gameserver, mod, assignment } = this.setupData;

      await this.client.gameserver.gameServerControllerUninstallModule(
        gameserver.id,
        mod.id
      );

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.id ===
          service.getJobId(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.cronJobs[0] as ServiceCronJobOutputDTO
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
      const { service, mod, assignment } = this.setupData;

      await this.adminClient.domain.domainControllerRemove(
        this.standardDomainId as string
      );

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.id ===
          service.getJobId(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.cronJobs[0] as ServiceCronJobOutputDTO
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
      const { service, mod, assignment } = this.setupData;

      await this.client.module.moduleControllerRemove(mod.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.id ===
          service.getJobId(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.cronJobs[0] as ServiceCronJobOutputDTO
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
      const { service, mod, assignment, gameserver } = this.setupData;

      await this.client.gameserver.gameServerControllerRemove(gameserver.id);

      const queue = queueService.queues.cronjobs.queue;
      const allRepeatables = await queue.getRepeatableJobs();
      const repeatables = allRepeatables.filter((job) => {
        return (
          job.id ===
          service.getJobId(
            assignment as ServiceModuleInstallationOutputDTO,
            mod.cronJobs[0] as ServiceCronJobOutputDTO
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
