import 'reflect-metadata';
import { getModules } from '@takaro/modules';
import { writeFile } from 'fs/promises';

async function main() {
  const modules = await getModules();
  const modulesJson = JSON.stringify(modules, null, 2);
  await writeFile('dist/modules.json', modulesJson);
  await writeFile('../web-docs/pages/modules.json', modulesJson);
}

main().catch(console.error);
