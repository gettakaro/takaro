import { Player } from '../../database/entity/player.entity';

export abstract class GameServer {

  abstract executeRawCommand(input: string) : Promise<CommandResult>;

  abstract fetchOnlinePlayers() : Promise<Player[]>;
  
}

interface CommandResult {
  input: string;
  output: string;
}