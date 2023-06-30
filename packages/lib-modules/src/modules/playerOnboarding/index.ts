import { BuiltinModule } from '../../BuiltinModule.js';
import { EventTypes } from '../../dto/index.js';
export class PlayerOnboarding extends BuiltinModule {
  constructor() {
    super(
      'playerOnboarding',
      'Collection of functions that are executed when a player joins the server. Helps with onboarding new players, like sending a welcome message.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          message: {
            type: 'string',
            minLength: 1,
            maxLength: 256,
            default: 'Welcome {player} to the server!',
          },
          starterKitItems: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 1,
              maxLength: 512,
            },
            default: [],
          },
        },
        additionalProperties: false,
      })
    );

    this.hooks = [
      {
        eventType: EventTypes.PLAYER_CONNECTED,
        name: 'playerConnected',
        function: '',
      },
    ];

    this.commands = [
      {
        name: 'starterkit',
        function: '',
        trigger: 'starterkit',
        helpText:
          'Get a starter kit, you can only execute this once on a server!',
      },
    ];
  }
}
