// Extracted from https://github.com/Claviz/dts-extractor
// And adjusted/integrated into the project

import fs from 'fs-extra';
import path from 'path';

async function getDts({
  nodeModulesPath,
  packages,
}: {
  nodeModulesPath: string;
  packages: string[];
}) {
  const typings: { [key: string]: string } = {};
  const parsedPackages: { [key: string]: boolean } = {};

  async function getTypingsForPackages(packages: string[] = []) {
    for (const packageName of packages) {
      if (!parsedPackages[packageName]) {
        parsedPackages[packageName] = true;
        const packagePath = `${nodeModulesPath}/${packageName}/package.json`;
        const packageExists = await fs.pathExists(packagePath);
        if (packageExists) {
          const packageJson = await fs.readJSON(packagePath);
          const types = packageJson.typings || packageJson.types;
          if (types) {
            typings[`file://node_modules/${packageName}/package.json`] =
              JSON.stringify({ name: packageJson.name, types });
            const dirname =
              path.dirname(types) === '.' ? '' : path.dirname(types);
            await getTypingsInDir(
              `${packageName}${dirname ? '/' : ''}${dirname}`
            );
          }
          if (packageJson.dependencies) {
            await getTypingsForPackages(Object.keys(packageJson.dependencies));
          }
        }
      }
    }
  }

  async function getTypingsInDir(path: string) {
    const dts = await fs.readdir(`${nodeModulesPath}/${path}`);
    for (const fileName of dts) {
      if (fileName.endsWith('.d.ts')) {
        const raw = await fs.readFile(
          `${nodeModulesPath}/${path}/${fileName}`,
          'utf8'
        );
        const splitLines = raw.split('\n');
        const removedExports = splitLines.map((line) => {
          return line.replace(/^export\s+/, '');
        });
        const removedImports = removedExports.filter((line) => {
          return !line.startsWith('import');
        });
        typings[`file://node_modules/${path}/${fileName}`] =
          removedImports.join('\n');
      } else if (
        (await fs.lstat(`${nodeModulesPath}/${path}/${fileName}`)).isDirectory()
      ) {
        await getTypingsInDir(`${path}/${fileName}`);
      }
    }
  }

  await getTypingsForPackages(packages);

  return typings;
}

async function main() {
  const dts = await getDts({
    nodeModulesPath: './node_modules',
    packages: ['@takaro/helpers'],
  });

  console.log(dts);
  const webMainEditorPath = path.join(
    __dirname,
    '..',
    'packages',
    'web-main',
    'src',
    'components',
    'modules',
    'Editor'
  );
  await fs.ensureDir(webMainEditorPath);
  await fs.writeJSON(
    path.join(webMainEditorPath, 'monacoCustomTypes.json'),
    dts
  );
}

main().catch(console.error);
