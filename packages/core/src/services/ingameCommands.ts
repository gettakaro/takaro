import { Consumer, EVENTS, IJsonMap } from '@takaro/shared';

import { IChatMessage } from './gameConnector/base';

export interface IngameCommandResult {
  result: IJsonMap;
}

export class IngameCommandConsumer extends Consumer<
  IChatMessage,
  IngameCommandResult
> {
  constructor() {
    super(EVENTS.CHAT_MESSAGE, async (job) => {
      const { data } = job;
      const { player, message } = data;

      // TODO: Arg handling
      // actual commands
      // ... everything :)

      const result = { msg: `"Executed command" ${message} for ${player}` };
      this.onError(new Error('Ingame command consumer not implemented'));
      return {
        result,
      };
    });
  }
}
