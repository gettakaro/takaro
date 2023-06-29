import { BuiltinModule } from '../../BuiltinModule.js';

export class Gimme extends BuiltinModule {
  constructor() {
    super(
      'gimme',
      'A module that randomly selects item from a list of items and entities',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          commands: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        required: ['items'],
        additionalProperties: false,
      })
    );

    this.commands = [
      {
        function: '',
        name: 'gimme',
        trigger: 'gimme',
        helpText: 'Randomly selects item from a list of items and entities',
      },
    ];
  }
}
