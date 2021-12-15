import { Player } from '../../database/entity/player.entity';
import { IJsonMap } from '../../type/json';

export abstract class GameServer {
  constructor(public id: string) {}

  abstract executeRawCommand(input: string): Promise<CommandResult>;

  abstract fetchOnlinePlayers(): Promise<Player[]>;

  abstract getConnectionInfo(): Promise<IJsonMap>;
}

interface CommandResult {
  input: string;
  output: string;
}
