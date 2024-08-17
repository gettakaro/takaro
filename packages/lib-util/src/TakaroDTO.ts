import { IsISO8601, IsString, ValidatorOptions, validate } from 'class-validator';
import { Exclude, instanceToPlain, plainToClass } from 'class-transformer';
import * as errors from './errors.js';

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
  constructor(data?: Nullable<DeepPartial<T>>) {
    Object.assign(this, data);
  }

  /**
   * Validates the DTO instance
   * @throws {ValidationError} if validation fails
   * @returns {Promise<void>}
   */
  async validate(extraOpts: ValidatorOptions = {}) {
    const obj = plainToClass(
      this.constructor as any,
      instanceToPlain(this, { enableImplicitConversion: true, ignoreDecorators: true }),
      {
        ignoreDecorators: true,
        excludePrefixes: ['_'],
        enableCircularCheck: true,
      },
    );

    const validationErrors = await validate(obj as object, {
      forbidNonWhitelisted: false,
      whitelist: true,
      forbidUnknownValues: false,
      ...extraOpts,
    });

    if (validationErrors.length) {
      const msg = `${validationErrors[0]}`;
      throw new errors.ValidationError(msg, validationErrors);
    }
  }

  toJSON() {
    return instanceToPlain(this, { enableImplicitConversion: true });
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
