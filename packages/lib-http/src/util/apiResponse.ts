export function apiResponse(
  data: Record<string, unknown> | Array<Record<string, unknown>> = {},
  error?: Error
) {
  const errorDetails = {
    message: error?.message,
    code: error?.name,
    // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
    details: error?.hasOwnProperty('details') ? error?.details : {},
  };

  return {
    meta: {
      serverTime: new Date().toISOString(),
      error: errorDetails,
    },
    data,
  };
}
