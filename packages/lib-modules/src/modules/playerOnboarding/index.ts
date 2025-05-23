import { ModuleTransferDTO, ICommand, IHook, ModuleTransferVersionDTO } from '../../BuiltinModule.js';
import { HookEvents } from '../../dto/index.js';

export class PlayerOnboarding extends ModuleTransferDTO<PlayerOnboarding> {
  constructor() {
    super();

    this.name = 'playerOnboarding';
    this.versions = [
      new ModuleTransferVersionDTO({
        tag: '0.0.2',
        description:
          'Collection of functions that are executed when a player joins the server. Helps with onboarding new players, like sending a welcome message.',
        configSchema: JSON.stringify({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            message: {
              title: 'Message',
              description: 'The message to send to the player when they join the server.',
              type: 'string',
              minLength: 1,
              maxLength: 256,
              default: 'Welcome {player} to the server!',
            },
            starterKitItems: {
              type: 'array',
              title: 'Starter kit items',
              'x-component': 'item',
              description:
                'List of items a player will receive when they execute the starterkit command for the first time.',
              uniqueItems: true,
              items: {
                type: 'object',
                title: 'Item',
                properties: {
                  item: {
                    type: 'string',
                    title: 'Item',
                  },
                  amount: {
                    type: 'number',
                    title: 'Amount',
                  },
                  quality: {
                    type: 'string',
                    title: 'Quality',
                  },
                },
              },
            },
          },
          required: [],
          additionalProperties: false,
        }),
        uiSchema: JSON.stringify({
          starterKitItems: {
            items: {
              item: {
                'ui:widget': 'item',
              },
            },
          },
        }),
        hooks: [
          new IHook({
            eventType: HookEvents.PLAYER_CONNECTED,
            name: 'playerConnected',
            function: this.loadFn('hooks', 'playerConnected'),
          }),
        ],
        commands: [
          new ICommand({
            name: 'starterkit',
            function: this.loadFn('commands', 'starterkit'),
            trigger: 'starterkit',
            helpText: 'Get a starter kit, you can only execute this once on a server!',
            arguments: [],
          }),
        ],
      }),
    ];
  }
}
