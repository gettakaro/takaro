/* eslint-disable @typescript-eslint/no-var-requires */
const { parseString } = require('xml2js');
const { promisify } = require('node:util');
const { readFile } = require('fs/promises');
const { parse } = require('csv/sync');
const parseXml = promisify(parseString);

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

async function main() {
  const localizationFile = await readFile('_data/sdtd/serverfiles/Data/Config/Localization.txt', 'utf-8');
  const localization = parse(localizationFile, { columns: true });
  const file = await readFile('_data/sdtd/serverfiles/Data/Config/items.xml');
  const xml = await parseXml(file);

  const items = {};

  xml.items.item.forEach((item) => {
    items[item.$.name] = { code: item.$.name };

    // Extract properties into a readable format
    item.property.forEach((prop) => {
      if (prop.$.name) {
        const propName = lowerCaseFirstLetter(prop.$.name);
        items[item.$.name][propName] = prop.$.value;
      }
    });
  });

  for (const item of Object.values(items)) {
    if (item.extends) {
      const parent = items[item.extends];
      items[item.code] = { ...parent, ...item };
    }

    const descriptionRecord = localization.find((l) => l.Key === `${item.code}Desc`);
    const name = localization.find((l) => l.Key === item.code);

    if (descriptionRecord) {
      items[item.code].description = descriptionRecord.english;
    }

    if (name) {
      items[item.code].name = name.english;
    }
  }

  console.log(JSON.stringify(items, null, 2));
}

main().catch(console.error);
