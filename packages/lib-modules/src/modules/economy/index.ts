import { BuiltinModule } from '../../BuiltinModule.js';

export class Economy extends BuiltinModule {
  constructor() {
    super(
      'economy',
      'A set of commands to allow players to manage their currency.',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          /* This are the config values the user can tweak*/
        },
        required: [],
        additionalProperties: false,
      })
    );

    this.commands = [
      {
        function: '',
        name: 'balance',
        trigger: 'balance',
        helpText: 'Check your balance',
        arguments: [],
      },
      {
        function: '',
        name: 'topmoney',
        trigger: 'topmoney',
        helpText: 'List of the 10 players with the highest balance',
        arguments: [],
      },
    ];
  }
}
