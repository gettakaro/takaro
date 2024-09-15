export function getData() {
  const rawData = process.env.DATA;

  if (!rawData) {
    console.error('Failed to get data');
    throw new Error('Failed to get data');
  }

  try {
    const parsed = JSON.parse(rawData);
    return parsed;
  } catch (error) {
    console.error('Failed to parse data', error);
    throw new Error('Failed to parse data');
  }
}
