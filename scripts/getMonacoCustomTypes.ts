/* eslint-disable no-console */
// Extracted from https://github.com/Claviz/dts-extractor
// And adjusted/integrated into the project

import fs from 'fs-extra';
import path from 'path';

async function getDts({ nodeModulesPath, packages }: { nodeModulesPath: string; packages: string[] }) {
  const typings: { [key: string]: string } = {};
  const parsedPackages: { [key: string]: boolean } = {};

  async function getTypingsForPackages(packages: string[] = []) {
    for (const packageName of packages) {
      console.log(`Getting typings for package: ${packageName}`);
      if (!parsedPackages[packageName]) {
        parsedPackages[packageName] = true;
        const packagePath = `${nodeModulesPath}/${packageName}/package.json`;
        const packageExists = await fs.pathExists(packagePath);
        if (packageExists) {
          const packageJson = await fs.readJSON(packagePath);
          const types = packageJson.typings || packageJson.types;
          if (types) {
            typings[`file://node_modules/${packageName}/package.json`] = JSON.stringify({
              name: packageJson.name,
              types,
            });
            const dirname = path.dirname(types) === '.' ? '' : path.dirname(types);
            await getTypingsInDir(`${packageName}${dirname ? '/' : ''}${dirname}`);
          }
          if (packageJson.dependencies) {
            console.log(`Getting typings for dependencies: ${Object.keys(packageJson.dependencies)}`);
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
        const raw = await fs.readFile(`${nodeModulesPath}/${path}/${fileName}`, 'utf8');
        const splitLines = raw.split('\n');
        const removedExports = splitLines.map((line) => {
          return line.replace(/^export\s+/, '');
        });
        const removedImports = removedExports.filter((line) => {
          return !line.startsWith('import');
        });
        typings[`file://node_modules/${path}/${fileName}`] = removedImports.join('\n');
      } else if ((await fs.lstat(`${nodeModulesPath}/${path}/${fileName}`)).isDirectory()) {
        await getTypingsInDir(`${path}/${fileName}`);
      }
    }
  }

  await getTypingsForPackages(packages);

  // Hacky fix...
  // Replace all instances of "import(\"axios\").AxiosResponse" with "AxiosResponse
  // There's some weird stuff going on with the axios types that I don't want to deal with

  const clientTypings = typings['file://node_modules/@takaro/apiclient/dist/generated/api.d.ts'];
  if (clientTypings) {
    typings['file://node_modules/@takaro/apiclient/dist/generated/api.d.ts'] = clientTypings
      .replace(/import\("axios"\)\.AxiosResponse/g, 'AxiosResponse')
      .replace(/import\("axios"\)\.AxiosRequestConfig/g, 'AxiosRequestConfig');
  }

  return typings;
}

async function main() {
  const dts = await getDts({
    nodeModulesPath: './node_modules',
    packages: ['axios', '@takaro/helpers', '@takaro/queues'],
  });

  const webMainEditorPath = path.join(__dirname, '..', 'packages', 'web-main', 'src', 'pages', 'studio', 'Editor');

  await fs.ensureDir(webMainEditorPath);
  await fs.writeJSON(path.join(webMainEditorPath, 'monacoCustomTypes.json'), dts);

  console.log(`Generated ${Object.keys(dts).length} typings. Saved to ${webMainEditorPath}`);
}

main().catch(console.error);
