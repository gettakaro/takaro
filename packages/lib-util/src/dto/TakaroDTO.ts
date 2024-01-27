import { IsISO8601, IsString, ValidatorOptions, validate } from 'class-validator';
import { Exclude, instanceToPlain } from 'class-transformer';
import { logger } from '../logger.js';
import * as errors from '../errors.js';

const log = logger('TakaroDTO');

type Nullable<T> = {
  [P in keyof T]: T[P] | null | undefined;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Generic Data Transfer Object, used widely in Takaro to pass data back and forth between components
 * Allows validation of properties when instantiated and JSON (de)serialization
 */
export class TakaroDTO<T> {
  /**
   * Validates the DTO instance
   * @throws {ValidationError} if validation fails
   * @returns {Promise<void>}
   */
  async validate(extraOpts: ValidatorOptions = {}) {
    const validationErrors = await validate(this, {
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      ...extraOpts,
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

  async construct(data?: Nullable<DeepPartial<T>>) {
    if (!data) {
      return this;
    }
    Object.assign(this, data);

    // TODO: enable this for much tighter validation of all DTOs
    // Atm this breaks too much stuff 😮‍💨
    //await this.validate();

    return this;
  }
}

export class NOT_DOMAIN_SCOPED_TakaroModelDTO<T> extends TakaroDTO<T> {
  @IsString()
  id: string;

  @IsISO8601()
  createdAt: string;

  @IsISO8601()
  updatedAt: string;
}

export class TakaroModelDTO<T> extends NOT_DOMAIN_SCOPED_TakaroModelDTO<T> {
  @IsString()
  @Exclude()
  domain: string;
}

export function isTakaroDTO<T>(value: unknown): value is TakaroDTO<T> {
  return value instanceof TakaroDTO;
}
