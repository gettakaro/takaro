import { BuiltinModule } from '../../BuiltinModule.js';

export class Teleports extends BuiltinModule {
  constructor() {
    super(
      'teleports',
      'A set of commands to allow players to set their own teleport points and teleport to them'
    );

    this.commands = [
      {
        function: '',
        name: 'teleport',
        trigger: 'teleport',
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
