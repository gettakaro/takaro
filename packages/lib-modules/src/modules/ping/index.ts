import { BuiltinModule } from '../../BuiltinModule.js';

export class Ping extends BuiltinModule {
  constructor() {
    super('ping');

    this.commands = [
      {
        function: '',
        name: 'ping',
        trigger: 'ping',
        helpText:
          'Replies with pong, useful for testing if the connection works',
      },
    ];
  }
}
