import { parseString } from 'xml2js';
import { promisify } from 'node:util';
import { readFile, readdir } from 'fs/promises';
import { parse } from 'csv/sync';
import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

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

      let tint;
      if (item.customIconTint) {
        const hex = item.customIconTint;
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        tint = { r, g, b };
      } else if (item.tintColor) {
        tint = item.tintColor.split(',').map((num) => parseInt(num.trim()));
      }

      if (tint) {
        await sharp(`${vanillaIconsFolder}/${iconFile}`).tint(tint).toFile(`${outputFolder}/${itemKey}.png`);
      } else {
        await copyFile(`${vanillaIconsFolder}/${iconFile}`, `${outputFolder}/${itemKey}.png`);
      }
    }
  }
}

main().catch(console.error);
