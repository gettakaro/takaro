import { isTakaroDTO, TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { IsString } from 'class-validator';
import { Request, Response } from 'express';

interface IApiResponseOptions {
  error?: Error;
  meta?: Record<string, string | number>;
  req: Request;
  res: Response;
}

export function apiResponse(data: unknown = {}, opts?: IApiResponseOptions) {
  const returnVal = {
    meta: {
      serverTime: new Date().toISOString(),
      error: opts?.error && {
        code: opts?.error?.name,
        details: opts?.error?.hasOwnProperty('details')
          ? // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
            opts?.error?.details
          : {},
      },
      page:
        opts?.meta?.total || opts?.meta?.total === 0
          ? opts?.res.locals.page
          : undefined,
      limit:
        opts?.meta?.total || opts?.meta?.total === 0
          ? opts?.res.locals.limit
          : undefined,
      ...opts?.meta,
    },
    data,
  };

  if (isTakaroDTO(data)) {
    returnVal.data = data.toJSON();
  }

  if (Array.isArray(data)) {
    returnVal.data = data.map((item) => {
      if (isTakaroDTO(item)) {
        return item.toJSON();
      }

      return item;
    });
  }

  return returnVal;
}

class ErrorOutput {
  @IsString()
  code?: string;
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
