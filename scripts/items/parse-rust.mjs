/* eslint-disable @typescript-eslint/no-var-requires */

import { readdir, readFile, copyFile } from 'node:fs/promises';

const location = './_data/rust';

async function main() {
  const items = {};
  const files = await readdir(`${location}/serverfiles/Bundles/items`);

  await Promise.all(
    files.map(async (file) => {
      const fileContent = await readFile(`${location}/serverfiles/Bundles/items/${file}`);
      const json = JSON.parse(fileContent);

      items[json.shortname] = json;
    }),
  );

  console.log(JSON.stringify(items, null, 2));
  await parseIcons(items);
}

async function parseIcons(items) {
  if (!process.env.RUST_ICONS_PATH) throw new Error('RUST_ICONS_PATH is not set');

  const outputFolder = 'packages/web-main/public/icons/rust';
  const iconsFolder = process.env.RUST_ICONS_PATH;
  const itemIcons = await readdir(iconsFolder);

  const icons = itemIcons.filter((icon) => icon.endsWith('.png'));

  await Promise.all(
    icons.map(async (icon) => {
      const name = icon.replace('.png', '');
      const item = items[name];

      if (!item) return;

      await copyFile(`${iconsFolder}/${icon}`, `${outputFolder}/${name}.png`);
    }),
  );
}

main().catch(console.error);
