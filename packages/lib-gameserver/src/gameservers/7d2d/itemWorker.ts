import { parentPort } from 'worker_threads';
import type { IItemDTO } from '../../interfaces/GameServer.js';

const vanillaItems = (await import('./items-7d2d.json', { assert: { type: 'json' } })).default as Record<string, any>;

if (!parentPort) {
  throw new Error('This file must be run as a worker thread');
}

parentPort.on('message', async (itemLines) => {
  if (!parentPort) {
    throw new Error('This file must be run as a worker thread');
  }

  try {
    const parsedItems = [];
    for (const line of itemLines) {
      const trimmed = line.trim();
      const dto: Partial<IItemDTO> = { code: trimmed };

      if (trimmed in vanillaItems) {
        dto.name = vanillaItems[trimmed].name;
        dto.description = vanillaItems[trimmed].description;
      }

      if (!dto.name) dto.name = dto.code;

      parsedItems.push(dto);
    }
    parentPort.postMessage(parsedItems);
  } catch (error) {
    if (!error) throw new Error('Error parsing items');
    parentPort.postMessage({ error });
  }
});
