import { BuiltinModule } from '../../BuiltinModule.js';

export class Teleports extends BuiltinModule {
  constructor() {
    super(
      'teleports',
      'A set of commands to allow players to set their own teleport points and teleport to them',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          maxTeleports: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 5,
          },
          timeout: {
            type: 'integer',
            description: 'The time in milliseconds required between teleports',
            minimum: 0,
            default: 1000,
          },
        },
        required: ['maxTeleports'],
        additionalProperties: false,
      })
    );

    this.commands = [
      {
        function: '',
        name: 'teleport',
        trigger: 'tp',
        helpText: 'Teleports to one of your set locations',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location to teleport to',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'tplist',
        trigger: 'tplist',
        helpText: 'Lists all your set locations',
      },
      {
        function: '',
        name: 'settp',
        trigger: 'settp',
        helpText: 'Sets a location to teleport to',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name',
            position: 0,
          },
        ],
      },
      {
        function: '',
        name: 'deletetp',
        trigger: 'deletetp',
        helpText: 'Deletes a location',
        arguments: [
          {
            name: 'tp',
            type: 'string',
            defaultValue: undefined,
            helpText: 'The location name',
            position: 0,
          },
        ],
      },
    ];
  }
}
