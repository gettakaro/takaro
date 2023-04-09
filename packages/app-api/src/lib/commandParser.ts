import { errors, logger } from '@takaro/util';
import { CommandOutputDTO } from '../service/CommandService';

interface IParsedCommand {
  command: string;
  arguments: Record<string, string | number | boolean>;
  [key: string]: string | Record<string, string | number | boolean>;
}

const log = logger('lib:commandParser');

export function parseCommand(
  rawMessage: string,
  command: CommandOutputDTO
): IParsedCommand {
  // Split, allowing for quotes
  const split = rawMessage.match(/(?:[^\s"]+|"[^"]*")+/g);

  if (!split) {
    log.error('Could not parse command', { rawMessage, command });
    throw new errors.InternalServerError();
  }

  const parsedArgs: Record<string, string | number | boolean> = {};

  const sortedArguments = command.arguments.sort(
    (a, b) => a.position - b.position
  );

  for (const [index, argument] of sortedArguments.entries()) {
    const rawValue = split[index + 1];
    let value;

    if (rawValue) {
      value = rawValue;
    } else if (argument.defaultValue) {
      value = argument.defaultValue;
    } else {
      log.error('Missing argument', { rawMessage, command, argument });
      throw new errors.BadRequestError(`Missing argument "${argument.name}"`);
    }

    switch (argument.type) {
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
            `Invalid number value for argument "${argument.name}"`
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
            `Invalid boolean value for argument "${argument.name}"`
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
