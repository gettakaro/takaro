import { $ } from 'zx';
import fs from 'fs-extra';
import path from 'path';

enum APIS {
  API = 'api',
  CONNECTOR = 'connector',
}

async function generateApiClient(host: string, api: APIS) {
  const directory = `./src/generated/${api}`;
  await $`npx @openapitools/openapi-generator-cli generate -i ${host}/openapi.json -g typescript-axios -o ${directory}`;

  // Next steps are used to fix the ESM imports in the generated
  // TypeScript files. This is required because the generator
  // does not add the .js extension to the imports.
  // This .js extension is required for the ESM imports to work.
  const allFiles = await fs.readdir(directory);
  const tsFiles = allFiles.filter((file) => file.endsWith('.ts'));

  for (const file of tsFiles) {
    const fullPath = path.join(directory, file);
    // sed command that replaces the import statement
    // from './configuration';
    // to './configuration.js';

    await $`sed -i 's/from '\\''\\.\\/configuration'\\''/from '\\''\\.\\/configuration\\.js'\\''/g' ${fullPath}`;
    await $`sed -i 's/from '\\''\\.\\/common'\\''/from '\\''\\.\\/common\\.js'\\''/g' ${fullPath}`;
    await $`sed -i 's/from '\\''\\.\\/base'\\''/from '\\''\\.\\/base\\.js'\\''/g' ${fullPath}`;
    await $`sed -i 's/from '\\''\\.\\/api'\\''/from '\\''\\.\\/api\\.js'\\''/g' ${fullPath}`;

    // Do the same for double quotes
    await $`sed -i 's/from "\\.\\/configuration"/from "\\.\\/configuration\\.js"/g' ${fullPath}`;
    await $`sed -i 's/from "\\.\\/common"/from "\\.\\/common\\.js"/g' ${fullPath}`;
    await $`sed -i 's/from "\\.\\/base"/from "\\.\\/base\\.js"/g' ${fullPath}`;
    await $`sed -i 's/from "\\.\\/api"/from "\\.\\/api\\.js"/g' ${fullPath}`;
  }
}

async function main() {
  let apiHost = process.env.TAKARO_API_HOST;
  let connectorHost = process.env.TAKARO_CONNECTOR_HOST;

  if (!apiHost) {
    console.log(
      'TAKARO_API_HOST is not set, defaulting to http://127.0.0.1:13000'
    );
    apiHost = 'http://127.0.0.1:13000';
  }

  if (!connectorHost) {
    console.log(
      'TAKARO_CONNECTOR_HOST is not set, defaulting to http://127.0.0.1:13006'
    );
    connectorHost = 'http://127.0.0.1:13006';
  }

  await generateApiClient(apiHost, APIS.API);
  await generateApiClient(connectorHost, APIS.CONNECTOR);
}

main().catch(console.error);
