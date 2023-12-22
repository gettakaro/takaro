/* eslint-disable @typescript-eslint/no-var-requires */

const { readdir, readFile } = require('fs/promises');

const location = './_data/rust';

async function main() {
  const items = {};
  const files = await readdir(`${location}/serverfiles/Bundles/items`);

  await Promise.all(
    files.map(async (file) => {
      const fileContent = await readFile(`${location}/serverfiles/Bundles/items/${file}`);
      const json = JSON.parse(fileContent);

      items[json.shortname] = json;
    })
  );

  console.log(JSON.stringify(items, null, 2));
}

main().catch(console.error);
