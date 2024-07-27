import { BuiltinModule, ICommand, IHook } from '../../BuiltinModule.js';
import { HookEvents } from '../../dto/index.js';
export class PlayerOnboarding extends BuiltinModule<PlayerOnboarding> {
  constructor() {
    super(
      'playerOnboarding',
      'Collection of functions that are executed when a player joins the server. Helps with onboarding new players, like sending a welcome message.',
      JSON.stringify({
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
            'x-component': 'item',
            title: 'Starter kit items',
            description:
              'List of items a player will receive when they execute the starterkit command for the first time.',
            uniqueItems: true,
            items: {
              type: 'string',
            },
          },
        },
        required: [],
        additionalProperties: false,
      }),
      JSON.stringify({
        starterKitItems: { 'ui:widget': 'item' },
      }),
    );

    this.hooks = [
      new IHook({
        eventType: HookEvents.PLAYER_CONNECTED,
        name: 'playerConnected',
        function: this.loadFn('hooks', 'playerConnected'),
      }),
    ];

    this.commands = [
      new ICommand({
        name: 'starterkit',
        function: this.loadFn('commands', 'starterkit'),
        trigger: 'starterkit',
        helpText: 'Get a starter kit, you can only execute this once on a server!',
        arguments: [],
      }),
    ];
  }
}
