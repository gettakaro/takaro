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
          allowBotMessage: {
            type: 'boolean',
            default: false,
          },
          allowTakaroBot: {
            type: 'boolean',
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
    ];
  }
}
