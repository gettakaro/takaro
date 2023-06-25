import { BuiltinModule } from '../../BuiltinModule.js';
import { DiscordEvents } from '../../dto.js';
import { GameEvents } from '@takaro/gameserver';

export class ChatBridge extends BuiltinModule {
  constructor() {
    super(
      'chatBridge',
      'Connect chat to other services like Discord.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          sendPlayerConnected: {
            type: 'boolean',
            description: 'Send a message when a player connects.',
            default: true,
          },
          sendPlayerDisconnected: {
            type: 'boolean',
            description: 'Send a message when a player disconnects.',
            default: true,
          },
        },
        additionalProperties: false,
      })
    );

    this.hooks = [
      {
        eventType: DiscordEvents.DISCORD_MESSAGE,
        name: 'DiscordToGame',
        function: '',
      },
      {
        eventType: GameEvents.CHAT_MESSAGE,
        name: 'GameToDiscord',
        function: '',
      },
      {
        eventType: GameEvents.PLAYER_CONNECTED,
        name: 'PlayerConnected',
        function: '',
      },
      {
        eventType: GameEvents.PLAYER_DISCONNECTED,
        name: 'PlayerDisconnected',
        function: '',
      },
    ];
  }
}
