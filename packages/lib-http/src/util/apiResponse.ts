import { Type } from 'class-transformer';
import { IsISO8601, ValidateNested } from 'class-validator';
import { IsString } from 'class-validator';

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

  return {
    meta: {
      serverTime: new Date().toISOString(),
      error: opts?.error ? errorDetails : undefined,
      ...opts?.meta,
    },
    data,
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
export class APIOutput<T> {
  @Type(() => MetadataOutput)
  @ValidateNested()
  metadata!: MetadataOutput;

  data!: T;
}
