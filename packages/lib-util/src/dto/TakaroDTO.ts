import { IsDate, IsString, validate } from 'class-validator';
import { Exclude, instanceToPlain } from 'class-transformer';
import { logger } from '../logger.js';
import * as errors from '../errors.js';

const log = logger('TakaroDTO');

/**
 * Generic Data Transfer Object, used widely in Takaro to pass data back and forth between components
 * Allows validation of properties when instantiated and JSON (de)serialization
 */
export class TakaroDTO<T> {
  async validate() {
    const validationErrors = await validate(this, {
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    if (validationErrors.length) {
      const msg = `${validationErrors[0]}`;
      log.warn(msg, validationErrors);
      throw new errors.ValidationError(msg, validationErrors);
    }
  }

  toJSON() {
    return instanceToPlain(this, {});
  }

  async construct(data: Partial<T> = {}) {
    Object.assign(this, data);
    //await this.validate();
    return this;
  }
}

export class NOT_DOMAIN_SCOPED_TakaroModelDTO<T> extends TakaroDTO<T> {
  @IsString()
  id: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class TakaroModelDTO<T> extends NOT_DOMAIN_SCOPED_TakaroModelDTO<T> {
  @IsString()
  @Exclude()
  domain: string;
}

export function isTakaroDTO<T>(value: unknown): value is TakaroDTO<T> {
  return value instanceof TakaroDTO;
}
