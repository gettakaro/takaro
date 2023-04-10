import {
  AdminClient,
  Client,
  GameServerOutputDTO,
  GameServerCreateDTOTypeEnum,
} from '@takaro/apiclient';
import { QueuesService } from '@takaro/queues';
import { logger, errors } from '@takaro/util';
import { config } from '../config.js';
import {
  Mock,
  SevenDaysToDie,
  Rust,
  SdtdConnectionInfo,
  RustConnectionInfo,
  MockConnectionInfo,
  IGameServer,
  TakaroEmitter,
  GameEvents,
} from '@takaro/gameserver';

type EmitterMapData = {
  emitter: TakaroEmitter;
  domainId: string;
};

export class ConnectorService {
  private takaro: AdminClient;
  private log = logger('ConnectorService');
  private emitterMap = new Map<string, EmitterMapData>();
  private eventsQueue = QueuesService.getInstance().queues.events.queue;

  constructor() {
    this.takaro = new AdminClient({
      url: config.get('takaro.url'),
      auth: {
        clientId: config.get('hydra.adminClientId'),
        clientSecret: config.get('hydra.adminClientSecret'),
      },
      OAuth2URL: config.get('hydra.publicUrl'),
    });
  }

  private getDomainScopedClient(token: string) {
    return new Client({
      url: config.get('takaro.url'),
      auth: {
        token,
      },
    });
  }

  private async getGame(gameserver: GameServerOutputDTO): Promise<IGameServer> {
    switch (gameserver.type) {
      case GameServerCreateDTOTypeEnum.Sevendaystodie:
        return new SevenDaysToDie(
          await new SdtdConnectionInfo().construct(gameserver.connectionInfo)
        );
      case GameServerCreateDTOTypeEnum.Rust:
        return new Rust(
          await new RustConnectionInfo().construct(gameserver.connectionInfo)
        );
      case GameServerCreateDTOTypeEnum.Mock:
        return new Mock(
          await new MockConnectionInfo().construct(gameserver.connectionInfo)
        );
      default:
        throw new errors.NotImplementedError();
    }
  }

  async add(domainId: string, gameServer: GameServerOutputDTO) {
    const emitter = (await this.getGame(gameServer)).getEventEmitter();

    this.emitterMap.set(gameServer.id, { emitter, domainId });

    this.attachListeners(domainId, gameServer.id, emitter);
    try {
      await emitter.start();
    } catch (error) {
      this.log.warn('Error while starting gameserver', { error });
    }

    this.log.info(`Added game server ${gameServer.id}`);
  }

  async remove(id: string) {
    const data = this.emitterMap.get(id);
    if (data) {
      const { emitter } = data;
      await emitter.stop();
      this.emitterMap.delete(id);
      this.log.info(`Removed game server ${id}`);
    } else {
      this.log.warn(
        'Tried to remove a GameServer from manager which does not exist'
      );
    }
  }

  public async init() {
    const domains = await this.takaro.domain.domainControllerSearch();
    for (const domain of domains.data.data) {
      this.log.info(`Handling domain ${domain.id}`);

      const domainTokenRes = await this.takaro.domain.domainControllerGetToken({
        domainId: domain.id,
      });

      const client = this.getDomainScopedClient(domainTokenRes.data.data.token);

      const gameServersRes =
        await client.gameserver.gameServerControllerSearch();

      this.log.info(`Found ${gameServersRes.data.data.length} game servers`);

      for (const gameServer of gameServersRes.data.data) {
        // Fetch each game server separately to get the connection info decrypted
        const gameserverRes =
          await client.gameserver.gameServerControllerGetOne(gameServer.id);
        await this.add(domain.id, gameserverRes.data.data);
      }
    }
  }

  private attachListeners(
    domainId: string,
    gameServerId: string,
    emitter: TakaroEmitter
  ) {
    emitter.on('error', (error) => {
      this.log.error('Error from game server', error);
    });

    emitter.on(GameEvents.LOG_LINE, async (logLine) => {
      this.log.debug('Received a logline event', logLine);
      await this.eventsQueue.add(GameEvents.LOG_LINE, {
        type: GameEvents.LOG_LINE,
        event: logLine,
        domainId,
        gameServerId,
      });
    });

    emitter.on(GameEvents.PLAYER_CONNECTED, async (playerConnectedEvent) => {
      this.log.debug('Received a player connected event', playerConnectedEvent);
      await this.eventsQueue.add(GameEvents.PLAYER_CONNECTED, {
        type: GameEvents.PLAYER_CONNECTED,
        event: playerConnectedEvent,
        domainId,
        gameServerId,
      });
    });

    emitter.on(
      GameEvents.PLAYER_DISCONNECTED,
      async (playerDisconnectedEvent) => {
        this.log.debug(
          'Received a player disconnected event',
          playerDisconnectedEvent
        );
        await this.eventsQueue.add(GameEvents.PLAYER_DISCONNECTED, {
          type: GameEvents.PLAYER_DISCONNECTED,
          event: playerDisconnectedEvent,
          domainId,
          gameServerId,
        });
      }
    );

    emitter.on(GameEvents.CHAT_MESSAGE, async (chatMessage) => {
      this.log.debug('Received a chatMessage event', chatMessage);
      await this.eventsQueue.add(GameEvents.CHAT_MESSAGE, {
        type: GameEvents.CHAT_MESSAGE,
        event: chatMessage,
        domainId,
        gameServerId,
      });
    });
  }
}
