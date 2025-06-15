import { parentPort } from 'worker_threads';
import type { IItemDTO } from '../../interfaces/GameServer.js';
import path from 'path';
import { readFile } from 'fs/promises';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const itemsJsonPath = path.join(__dirname, 'items-7d2d.json');

if (!parentPort) {
  throw new Error('This file must be run as a worker thread');
}

parentPort.on('message', async (itemLines) => {
  if (!parentPort) {
    throw new Error('This file must be run as a worker thread');
  }

  const vanillaItems = JSON.parse(await readFile(itemsJsonPath, 'utf8'));

  try {
    const parsedItems = [];
    for (const line of itemLines) {
      const trimmed = line.trim();
      const dto: Partial<IItemDTO> = { code: trimmed };

      if (trimmed in vanillaItems) {
        dto.name = vanillaItems[trimmed].name;
        dto.description = vanillaItems[trimmed].description;
        dto.icon = vanillaItems[trimmed].customIcon;
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
