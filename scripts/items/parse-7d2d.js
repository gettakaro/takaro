/* eslint-disable @typescript-eslint/no-var-requires */
const { parseString } = require('xml2js');
const { promisify } = require('node:util');
const { readFile, readdir } = require('fs/promises');
const { parse } = require('csv/sync');
const { mkdir, copyFile } = require('node:fs/promises');
const parseXml = promisify(parseString);
const sharp = require('sharp');

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
  await parseIcons(items);
}

async function parseIcons(items) {
  const outputFolder = 'packages/web-main/public/icons/7d2d';
  const vanillaIconsFolder = '_data/sdtd/serverfiles/Data/ItemIcons';
  const itemIcons = await readdir(vanillaIconsFolder);
  await mkdir(outputFolder, { recursive: true });

  // Some items have an icon but are not listed in the json (🙄)
  // So we just copy all icons to the output folder as a base
  await Promise.all(itemIcons.map((icon) => copyFile(`${vanillaIconsFolder}/${icon}`, `${outputFolder}/${icon}`)));

  for (const itemKey in items) {
    if (Object.hasOwnProperty.call(items, itemKey)) {
      const item = items[itemKey];

      let iconFile = itemIcons.find((i) => i.toLowerCase().includes(itemKey.toLowerCase()));

      if (!iconFile && item.customIcon) {
        iconFile = itemIcons.find((i) => i.toLowerCase().includes(item.customIcon.toLowerCase()));
      }
      if (!iconFile) {
        throw new Error(`Could not find icon for ${itemKey}`);
      }

      if (item.tintColor) {
        const rgb = item.tintColor.split(',').map((num) => parseInt(num.trim()));

        await sharp(`${vanillaIconsFolder}/${iconFile}`)
          .tint({ r: rgb[0], g: rgb[1], b: rgb[2] })
          .toFile(`${outputFolder}/${itemKey}.png`);
      } else {
        await copyFile(`${vanillaIconsFolder}/${iconFile}`, `${outputFolder}/${itemKey}.png`);
      }
    }
  }
}

main().catch(console.error);
