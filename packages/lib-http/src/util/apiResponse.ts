import { errors, isTakaroDTO, TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsString,
  ValidationError as ClassValidatorError,
} from 'class-validator';
import { Request, Response } from 'express';

class ErrorOutput {
  @IsString()
  code?: string;

  @IsString()
  message?: string;

  @IsString()
  details?: string | ClassValidatorError[];
}

class MetadataOutput {
  @IsString()
  @IsISO8601()
  serverTime!: string;

  @Type(() => ErrorOutput)
  @ValidateNested()
  error?: ErrorOutput;

  /**
   * The page number of the response
   */
  @IsNumber()
  @IsOptional()
  page?: number;

  /**
   * The number of items returned in the response (aka page size)
   */
  @IsNumber()
  @IsOptional()
  limit?: number;

  /**
   * The total number of items in the collection
   */
  @IsNumber()
  @IsOptional()
  total?: number;
}
export class APIOutput<T> extends TakaroDTO<APIOutput<T>> {
  @Type(() => MetadataOutput)
  @ValidateNested()
  meta!: MetadataOutput;

  data!: T;
}

interface IApiResponseOptions {
  error?: Error;
  meta?: Record<string, string | number>;
  req: Request;
  res: Response;
}

export function apiResponse(data: unknown = {}, opts?: IApiResponseOptions): APIOutput<unknown> {
  const returnVal = new APIOutput<unknown>();

  returnVal.meta = new MetadataOutput();
  returnVal.data = {};

  if (opts?.error) {
    returnVal.meta.error = new ErrorOutput();

    returnVal.meta.error.code = String(opts.error.name);

    if ('details' in opts.error) {
      if (opts.error instanceof errors.ValidationError) {
        returnVal.meta.error.details = opts.error.details as ClassValidatorError[];
      } else {
        returnVal.meta.error.details = opts.error.details as string;
      }
    }

    returnVal.meta.error.message = String(opts.error.message);
  }

  if (opts?.meta) {
    returnVal.meta.page = opts?.res.locals.page;
    returnVal.meta.limit = opts?.res.locals.limit;
    returnVal.meta.total = opts?.meta.total as number;
  }

  if (isTakaroDTO(data)) {
    returnVal.data = data.toJSON();
  } else if (Array.isArray(data)) {
    returnVal.data = data.map((item) => {
      if (isTakaroDTO(item)) {
        return item.toJSON();
      }

      return item;
    });
  } else {
    returnVal.data = data;
  }

  return returnVal;
}
