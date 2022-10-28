import { Type } from 'class-transformer';
import { IsISO8601, ValidateNested } from 'class-validator';
import { IsString } from 'class-validator';
import { isTakaroDTO, TakaroDTO } from './TakaroDTO';

interface IApiResponseOptions {
  error?: Error;
  meta?: Record<string, string | number>;
}

export function apiResponse(data: unknown = {}, opts?: IApiResponseOptions) {
  const errorDetails = {
    code: opts?.error?.name,
    // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
    details: opts?.error?.hasOwnProperty('details') ? opts?.error?.details : {},
  };

  let parsed = data;

  if (isTakaroDTO(data)) {
    parsed = data.toJSON();
  }

  if (Array.isArray(data)) {
    parsed = data.map((item) => {
      if (isTakaroDTO(item)) {
        return item.toJSON();
      }

      return item;
    });
  }

  return {
    meta: {
      serverTime: new Date().toISOString(),
      error: opts?.error ? errorDetails : undefined,
      ...opts?.meta,
    },
    data: parsed,
  };
}

class ErrorOutput {
  @IsString()
  code!: string;
}

class MetadataOutput {
  @IsString()
  @IsISO8601()
  serverTime!: string;

  @Type(() => ErrorOutput)
  @ValidateNested()
  error?: ErrorOutput;
}
export class APIOutput<T> extends TakaroDTO<APIOutput<T>> {
  @Type(() => MetadataOutput)
  @ValidateNested()
  metadata!: MetadataOutput;

  data!: T;
}
