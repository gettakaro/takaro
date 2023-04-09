import { GameEvents } from '@takaro/gameserver';
import { BuiltinModule } from '../../BuiltinModule';

export class PlayerGreeter extends BuiltinModule {
  constructor() {
    super(
      'playerGreeter',
      'Sends a message to players who join the server',
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
