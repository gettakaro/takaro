export function apiResponse(
  data: Record<string, unknown> | Array<Record<string, unknown>>
) {
  return {
    meta: {
      serverTime: new Date().toISOString(),
    },
    data,
  };
}
