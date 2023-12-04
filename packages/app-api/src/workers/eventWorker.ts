import { Job } from 'bullmq';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import {
  isChatMessageEvent,
  isConnectedEvent,
  isDisconnectedEvent,
  isEntityKilledEvent,
  isPlayerDeathEvent,
} from '@takaro/modules';
import { getSocketServer } from '../lib/socketServer.js';
import { HookService } from '../service/HookService.js';
import { PlayerService } from '../service/PlayerService.js';
import { CommandService } from '../service/CommandService.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from '../service/PlayerOnGameserverService.js';
import { GameServerService } from '../service/GameServerService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../service/EventService.js';

const log = logger('worker:events');

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(config.get('queues.events.name'), config.get('queues.events.concurrency'), processJob);
  }
}

async function processJob(job: Job<IEventQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });
  log.info('Processing an event', job.data);

  const { type, event, domainId, gameServerId } = job.data;

  const eventService = new EventService(domainId);
  const hooksService = new HookService(domainId);
  await hooksService.handleEvent(event, gameServerId);

  const socketServer = await getSocketServer();
  socketServer.emit(domainId, 'gameEvent', [gameServerId, type, event]);

  if ('player' in event && event.player) {
    const playerService = new PlayerService(domainId);
    await playerService.sync(event.player, gameServerId);

    const gameServerService = new GameServerService(domainId);
    const playerOnGameServerService = new PlayerOnGameServerService(domainId);

    const resolvedPlayer = await playerService.resolveRef(event.player, gameServerId);
    await gameServerService.getPlayerLocation(gameServerId, resolvedPlayer.id);

    await playerOnGameServerService.addInfo(
      event.player,
      gameServerId,
      await new PlayerOnGameServerUpdateDTO().construct({
        ip: event.player.ip,
        ping: event.player.ping,
      })
    );

    if (isChatMessageEvent(event)) {
      const commandService = new CommandService(domainId);
      await commandService.handleChatMessage(event, gameServerId);

      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: EVENT_TYPES.CHAT_MESSAGE,
          gameserverId: gameServerId,
          playerId: resolvedPlayer.id,
          meta: {
            message: event.msg,
          },
        })
      );
    }

    if (isConnectedEvent(event)) {
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: EVENT_TYPES.PLAYER_CONNECTED,
          gameserverId: gameServerId,
          playerId: resolvedPlayer.id,
        })
      );
    }

    if (isDisconnectedEvent(event)) {
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: EVENT_TYPES.PLAYER_DISCONNECTED,
          gameserverId: gameServerId,
          playerId: resolvedPlayer.id,
        })
      );
    }

    if (isPlayerDeathEvent(event)) {
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: EVENT_TYPES.PLAYER_DEATH,
          gameserverId: gameServerId,
          playerId: resolvedPlayer.id,
          meta: {
            position: event.position,
          },
        })
      );
    }

    if (isEntityKilledEvent(event)) {
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: EVENT_TYPES.ENTITY_KILLED,
          gameserverId: gameServerId,
          playerId: resolvedPlayer.id,
          meta: {
            entity: event.entity,
            weapon: event.weapon,
          },
        })
      );
    }
  }
}
