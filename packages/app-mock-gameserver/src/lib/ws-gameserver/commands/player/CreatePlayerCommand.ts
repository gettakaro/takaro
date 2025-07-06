import { BaseCommand, CommandContext, ValidationResult } from '../types.js';
import { CommandOutput, IPlayerReferenceDTO } from '@takaro/gameserver';
import { IGamePlayer } from '@takaro/modules';
import { faker } from '@faker-js/faker';
import { getRandomPublicIP } from '../../IpGenerator.js';

export class CreatePlayerCommand extends BaseCommand {
  name = 'createPlayer';
  description = 'Create a new player with specified data';
  usage = 'createPlayer <gameId> <jsonData>';
  examples = [
    'createPlayer newPlayer123 {"name":"John","steamId":"12345"}',
    'createPlayer testPlayer {"name":"TestUser","ip":"192.168.1.100"}',
  ];
  aliases = ['cp', 'addplayer'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    // Parse command: createPlayer <gameId> {data}
    const match = this.parseCommandWithJson(args);
    if (!match) {
      return this.error('Invalid command format. Use: createPlayer <gameId> {data}');
    }

    const { gameId, jsonString } = match;
    const parseResult = this.parseJson(jsonString);

    if (parseResult.error) {
      return this.error(`Failed to parse JSON data: ${parseResult.error}`);
    }

    const data = parseResult.data;

    try {
      // Check if player already exists
      const existingPlayer = await context.dataHandler.getPlayer(new IPlayerReferenceDTO({ gameId }));
      if (existingPlayer) {
        return this.error(`Player with gameId ${gameId} already exists`);
      }

      // Create new player with provided data
      const player = new IGamePlayer({
        gameId,
        name: data.name || faker.internet.userName(),
        steamId: data.steamId || faker.string.alphanumeric(16),
        epicOnlineServicesId: data.epicOnlineServicesId || faker.string.alphanumeric(16),
        xboxLiveId: data.xboxLiveId || faker.string.alphanumeric(16),
        ip: data.ip || getRandomPublicIP(),
        ping: data.ping || faker.number.int({ max: 99 }),
      });

      const meta = {
        position: {
          x: data.positionX || faker.number.int({ min: -1000, max: 1000 }),
          y: data.positionY || faker.number.int({ min: 0, max: 255 }),
          z: data.positionZ || faker.number.int({ min: -1000, max: 1000 }),
        },
        health: data.health || faker.number.int({ min: 50, max: 100 }),
        armor: data.armor || faker.number.int({ min: 0, max: 100 }),
        level: data.level || faker.number.int({ min: 1, max: 50 }),
        currency: data.currency || faker.number.int({ min: 0, max: 10000 }),
        online: false,
        ...data, // Allow overriding any meta field
      };

      await context.dataHandler.addPlayer(player, meta);
      await context.dataHandler.initializePlayerInventory(gameId);

      // If player is online, emit connection event
      if (meta.online) {
        const { EventPlayerConnected, GameEvents } = await import('@takaro/modules');
        context.gameServer.sendEvent(
          GameEvents.PLAYER_CONNECTED,
          new EventPlayerConnected({
            player,
            msg: 'Player connected',
            type: GameEvents.PLAYER_CONNECTED,
          }),
        );
      }

      return this.success(`Created player ${gameId} with name: ${player.name}`);
    } catch (error) {
      context.log.error(`Error creating player ${gameId}:`, error);
      return this.error(`Error creating player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validate(args: string[]): ValidationResult {
    if (args.length < 2) {
      return {
        valid: false,
        error: 'Both gameId and JSON data are required. Usage: createPlayer <gameId> {data}',
      };
    }
    return { valid: true };
  }

  private parseCommandWithJson(args: string[]): { gameId: string; jsonString: string } | null {
    if (args.length < 2) return null;

    const gameId = args[0];
    // Join the rest as it might contain spaces in the JSON
    const jsonString = args.slice(1).join(' ');

    return { gameId, jsonString };
  }
}
