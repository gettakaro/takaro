import { database, EVENTS, Producer } from '@takaro/shared';

import { IngameCommandResult } from '../ingameCommands';

export interface IChatMessage extends GameEvent {
  player: database.Player
  message: string
}

export interface IPlayerConnected extends GameEvent {
  player: database.Player
}

export interface IPlayerDisconnected extends GameEvent {
  player: database.Player
}

export interface ILogLine extends GameEvent {
  msg: string
}

export interface GameEvent {
  type: EVENTS,
}

export abstract class GameConnector {
  private ingameCommandProducer = new Producer<IChatMessage, IngameCommandResult>(EVENTS.CHAT_MESSAGE);

  constructor(public id: string) { }

  public async start(): Promise<void> {
    await this.startListening();
  }

  public async stop(): Promise<void> {
    await this.stopListening();
    await this.ingameCommandProducer.destroy();
  }

  protected abstract startListening(): Promise<void>;
  protected abstract stopListening(): Promise<void>;
  /**
   * Translate the game data to Takaro data
   * @param data whatever comes out of the gameserver, handle it! :)
   */
  abstract parseMessage(data: unknown): Promise<GameEvent>;

  protected async handleMessage(event: GameEvent): Promise<void> {
    switch (event.type) {
      case EVENTS.CHAT_MESSAGE:
        await this.ingameCommandProducer.add(event as IChatMessage);
        break;

      default:
        throw new Error(`Event type not implemented: ${event.type}`);
        break;
    }
  }


}