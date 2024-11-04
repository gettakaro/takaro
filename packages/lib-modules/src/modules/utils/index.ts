import { BuiltinModule, ICommand } from '../../BuiltinModule.js';

export class Utils extends BuiltinModule<Utils> {
  constructor() {
    super(
      'utils',
      'A collection of useful commands',
      '0.0.1',
      JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        additionalProperties: false,
      }),
    );

    this.commands = [
      new ICommand({
        function: this.loadFn('commands', 'ping'),
        name: 'ping',
        trigger: 'ping',
        helpText: 'Replies with pong, useful for testing if the connection works.',
        arguments: [],
      }),
      new ICommand({
        function: this.loadFn('commands', 'help'),
        name: 'help',
        trigger: 'help',
        helpText: 'The text you are reading right now, displays information about commands.',
        arguments: [
          {
            name: 'command',
            type: 'string',
            defaultValue: 'all',
            helpText: 'The command to get help for',
            position: 0,
          },
        ],
      }),
    ];
  }
}
