import { config } from './config.js';
import {
  ICommandJobData,
  IConnectorQueueData,
  ICronJobData,
  IEventQueueData,
  IHookJobData,
  IGameServerQueueData,
  ICSMMImportData,
} from './dataDefinitions.js';
import { TakaroQueue } from './TakaroQueue.js';

class QueuesService {
  private static instance: QueuesService;

  public static getInstance(): QueuesService {
    if (!QueuesService.instance) {
      QueuesService.instance = new QueuesService();
    }
    return QueuesService.instance;
  }

  async disconnect() {
    for (const queue of Object.values(this.queuesMap)) {
      await queue.queue.bullQueue.close();
    }
  }

  private queuesMap = {
    commands: {
      queue: new TakaroQueue<ICommandJobData>(config.get('queues.commands.name')),
    },
    cronjobs: {
      queue: new TakaroQueue<ICronJobData>(config.get('queues.cronjobs.name')),
    },
    hooks: {
      queue: new TakaroQueue<IHookJobData>(config.get('queues.hooks.name')),
    },
    events: {
      queue: new TakaroQueue<IEventQueueData>(config.get('queues.events.name')),
    },
    connector: {
      queue: new TakaroQueue<IConnectorQueueData>(config.get('queues.connector.name')),
    },
    itemsSync: {
      queue: new TakaroQueue<IGameServerQueueData>(config.get('queues.itemsSync.name')),
    },
    bansSync: {
      queue: new TakaroQueue<IGameServerQueueData>(config.get('queues.bansSync.name')),
    },
    playerSync: {
      queue: new TakaroQueue<IGameServerQueueData>(config.get('queues.playerSync.name')),
    },
    steamSync: {
      queue: new TakaroQueue<IGameServerQueueData>(config.get('queues.steamSync.name')),
    },
    csmmImport: {
      queue: new TakaroQueue<ICSMMImportData>(config.get('queues.csmmImport.name')),
    },
    kpi: {
      queue: new TakaroQueue<Record<string, unknown>>(config.get('queues.kpi.name')),
    },
    system: {
      queue: new TakaroQueue<Record<string, unknown>>(config.get('queues.system.name')),
    },
  };

  get queues() {
    return this.queuesMap;
  }
}

export const queueService = QueuesService.getInstance();
