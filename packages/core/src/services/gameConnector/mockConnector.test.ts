import { GameConnector, GameEvent } from './base';

export class MockConnector extends GameConnector {
  private interval: NodeJS.Timer;
  constructor(public id: string, private mockData: Array<unknown> = []) {
    super(id);
  }

  startListening(): Promise<void> {
    this.interval = setInterval(() => {
      this.parseMessage(this.mockData.shift() as GameEvent);
    }, 100);
    return;
  }

  stopListening(): Promise<void> {
    clearInterval(this.interval);
    return;
  }

  async parseMessage(data: unknown): Promise<GameEvent> {
    this.handleMessage(data as GameEvent);
    return data as GameEvent;
  }
}
