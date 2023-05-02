import { GameEvents } from '@takaro/gameserver';
import { BuiltinModule } from '../../BuiltinModule.js';

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
        },
        additionalProperties: false,
      })
    );

    this.hooks = [
      {
        eventType: GameEvents.PLAYER_CONNECTED,
        name: 'playerConnected',
        function: '',
      },
    ];
  }
}
