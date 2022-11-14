import { BuiltinModule } from '../../BuiltinModule';

export class Ping extends BuiltinModule {
  constructor() {
    super('ping');

    this.commands = [
      {
        function: 'console.log("pong");',
        name: 'ping',
      },
    ];
  }
}
