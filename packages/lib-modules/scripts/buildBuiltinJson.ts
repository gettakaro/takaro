import 'reflect-metadata';
import { getModules } from '@takaro/modules';
import { writeFile } from 'fs/promises';
import { readdir, readFile } from 'node:fs/promises';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function main() {
  // Built in modules
  // TODO: we should probably 'export' them in CI and save it as JSON so it's consistent with the community modules
  const modules = await getModules();
  const modulesJson = JSON.stringify(modules, null, 2);
  await writeFile('dist/modules.json', modulesJson);
  await writeFile('../web-docs/pages/modules.json', modulesJson);
  await writeFile('../e2e/src/web-main/fixtures/modules.json', modulesJson);

  // Community modules
  const files = await readdir(`${__dirname}/../src/community-modules/modules`);
  const communityModules: Array<string> = [];

  for (const file of files) {
    const content = await readFile(`${__dirname}/../src/community-modules/modules/${file}`, 'utf-8');
    communityModules.push(JSON.parse(content));
  }

  const communityModulesJson = JSON.stringify(communityModules, null, 2);
  await writeFile('dist/community-modules.json', communityModulesJson);
  await writeFile('../web-docs/pages/community-modules.json', communityModulesJson);
  await writeFile('../e2e/src/web-main/fixtures/community-modules.json', communityModulesJson);
}

// eslint-disable-next-line no-console
main().catch(console.error);
