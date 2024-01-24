import { BuiltinModule } from '../../BuiltinModule.js';
import { HookEvents } from '../../dto/index.js';

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
        eventType: HookEvents.DISCORD_MESSAGE,
        name: 'DiscordToGame',
        function: '',
      },
      {
        eventType: HookEvents.CHAT_MESSAGE,
        name: 'GameToDiscord',
        function: '',
      },
      {
        eventType: HookEvents.PLAYER_CONNECTED,
        name: 'PlayerConnected',
        function: '',
      },
      {
        eventType: HookEvents.PLAYER_DISCONNECTED,
        name: 'PlayerDisconnected',
        function: '',
      },
    ];
  }
}
