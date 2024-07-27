import { errors, logger } from '@takaro/util';
import { CommandOutputDTO } from '../service/CommandService.js';
import { IParsedCommand } from '@takaro/queues';
import { tryResolvePlayer } from './tryResolvePlayer.js';

const log = logger('lib:commandParser');

export async function parseCommand(
  rawMessage: string,
  command: CommandOutputDTO,
  gameServerId: string,
): Promise<IParsedCommand> {
  const split = rawMessage.match(/(?:[^\s"]+|"[^"]*")+/g);

  if (!split) {
    log.error('Could not parse command', { rawMessage, command });
    throw new errors.InternalServerError();
  }

  const parsedArgs: IParsedCommand['arguments'] = {};

  const sortedArguments = command.arguments.sort((a, b) => a.position - b.position);

  for (const [index, argument] of sortedArguments.entries()) {
    const rawValue = split[index + 1];
    let value;

    if (rawValue) {
      value = rawValue;
    } else if (argument.defaultValue) {
      value = argument.defaultValue;
    } else {
      log.warn('Missing argument', { rawMessage, command, argument });
      throw new errors.BadRequestError(
        `Oops! It seems you forgot to provide the "${argument.name}" value. Please check and try again.`,
      );
    }

    switch (argument.type) {
      case 'player':
        parsedArgs[argument.name] = await tryResolvePlayer(value, gameServerId);
        break;
      case 'string':
        parsedArgs[argument.name] = value.replace(/"/g, '');
        break;
      case 'number':
        const parsed = parseInt(value, 10);

        if (isNaN(parsed)) {
          log.warn('Invalid number value', {
            rawMessage,
            command,
            argument,
            value,
          });
          throw new errors.BadRequestError(
            `The value for "${argument.name}" should be a number. Please correct it and try again.`,
          );
        }

        parsedArgs[argument.name] = parseInt(value, 10);
        break;
      case 'boolean':
        if (value !== 'true' && value !== 'false') {
          log.warn('Invalid boolean value', {
            rawMessage,
            command,
            argument,
            value,
          });
          throw new errors.BadRequestError(
            `The value for "${argument.name}" should be either "true" or "false". Please correct it and try again.`,
          );
        }

        parsedArgs[argument.name] = value === 'true';
    }
  }

  log.debug('Parsed command', { rawMessage, command, parsedArgs });
  return {
    command: command.trigger,
    arguments: parsedArgs,
  };
}
