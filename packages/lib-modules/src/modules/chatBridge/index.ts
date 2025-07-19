import { ModuleTransferDTO, IHook, ModuleTransferVersionDTO } from '../../BuiltinModule.js';
import { HookEvents } from '../../dto/index.js';

export class ChatBridge extends ModuleTransferDTO<ChatBridge> {
  constructor() {
    super();
    this.name = 'chatBridge';
    this.author = 'Takaro';
    this.supportedGames = ['all'];
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.1',
        description: 'Connect chat to other services like Discord.',
        configSchema: JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            sendPlayerConnected: {
              title: 'Send player connected',
              type: 'boolean',
              description: 'Send a message when a player connects.',
              default: true,
            },
            sendPlayerDisconnected: {
              title: 'Send player disconnected',
              type: 'boolean',
              description: 'Send a message when a player disconnects.',
              default: true,
            },
            onlyGlobalChat: {
              title: 'Only global chat',
              type: 'boolean',
              default: true,
              description: 'Only relay messages from global chat. (no team chat or private messages)',
            },
          },
          additionalProperties: false,
        }),
        hooks: [
          new IHook({
            eventType: HookEvents.DISCORD_MESSAGE,
            name: 'DiscordToGame',
            function: this.loadFn('hooks', 'DiscordToGame'),
          }),
          new IHook({
            eventType: HookEvents.CHAT_MESSAGE,
            name: 'GameToDiscord',
            function: this.loadFn('hooks', 'GameToDiscord'),
          }),
          new IHook({
            eventType: HookEvents.PLAYER_CONNECTED,
            name: 'PlayerConnected',
            function: this.loadFn('hooks', 'PlayerConnected'),
          }),
          new IHook({
            eventType: HookEvents.PLAYER_DISCONNECTED,
            name: 'PlayerDisconnected',
            function: this.loadFn('hooks', 'PlayerDisconnected'),
          }),
        ],
      }),
    ];
  }
}
