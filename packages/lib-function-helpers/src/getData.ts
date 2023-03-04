import { config } from './config';

export async function getData() {
  const rawData = config.get('data');

  try {
    const parsed = JSON.parse(rawData);
    return parsed;
  } catch (error) {
    console.error('Failed to parse data', error);
    throw new Error('Failed to parse data');
  }
}
