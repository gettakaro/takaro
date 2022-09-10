function parseData(data: any) {
  if (!data) return null;

  if (data.toJson instanceof Function) {
    return data.toJson();
  }

  return data;
}

export function apiResponse(data: unknown = {}, error?: Error) {
  const parsedData = parseData(data);

  const errorDetails = {
    message: error?.message,
    code: error?.name,
    // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
    details: error?.hasOwnProperty('details') ? error?.details : {},
  };

  return {
    meta: {
      serverTime: new Date().toISOString(),
      error: error ? errorDetails : undefined,
    },
    data: parsedData,
  };
}
