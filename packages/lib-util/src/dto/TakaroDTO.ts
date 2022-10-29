import { validate } from 'class-validator';
import { classToPlain } from 'class-transformer';
import { logger } from '../logger';
import * as errors from '../errors';

/**
 * Generic Data Transfer Object, used widely in Takaro to pass data back and forth between components
 * Allows validation of properties when instantiated and JSON (de)serialization
 */
export class TakaroDTO<T> {
  constructor(data: Partial<T> = {}) {
    Object.assign(this, data);
  }

  async validate() {
    const validationErrors = await validate(this, {
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    if (validationErrors.length) {
      const msg = `${validationErrors[0]}`;
      logger('TakaroDTO').warn(msg, validationErrors);
      throw new errors.ValidationError(msg, validationErrors);
    }
  }

  toJSON() {
    return classToPlain(this, {});
  }
}

export function isTakaroDTO<T>(value: unknown): value is TakaroDTO<T> {
  return value instanceof TakaroDTO;
}
