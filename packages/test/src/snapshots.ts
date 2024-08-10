import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { JsonObject } from 'type-fest';
import { expect } from './test/expect.js';
import { omit } from 'lodash-es';
import { ITakaroAPIAxiosResponse } from '@takaro/apiclient';
import { IIntegrationTest } from './integrationTest.js';
import * as url from 'url';
import { integrationConfig } from './main.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function normalizePath(path: string) {
  return path.split('/').join('');
}

// These are fields that are allowed to be different in snapshots
const DEFAULT_FILTERED_FIELDS = [
  'createdAt',
  'updatedAt',
  'id',
  'serverTime',
  'domainId',
  'url',
  'snapshot',
  'permissionId',
];

function filterFields(data: unknown, filteredFields = DEFAULT_FILTERED_FIELDS): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => filterFields(item, filteredFields));
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data as JsonObject)
        .filter(([key]) => !filteredFields.includes(key))
        .map(([key, value]) => [key, filterFields(value, filteredFields)]),
    );
  }
  return data;
}

export async function matchSnapshot<SetupData>(
  test: IIntegrationTest<SetupData>,
  response: ITakaroAPIAxiosResponse<unknown>,
) {
  const snapshotPath = path.resolve(__dirname, '../src/__snapshots__', test.group, normalizePath(`${test.name}.json`));
  let file = '';

  const fullData = {
    body: response.data,
    status: response.status,
    test: omit(test, 'setup', 'teardown', 'test'),
  };

  try {
    file = await readFile(snapshotPath, { encoding: 'utf-8' });
  } catch (_error) {
    await mkdir(path.dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify(fullData, null, 2));
    throw new Error(`No snapshot exists, created a new one: ${snapshotPath}`);
  }

  const filteredFields = [...DEFAULT_FILTERED_FIELDS, ...(test.filteredFields ?? [])];
  const snapshotData = filterFields(JSON.parse(file), filteredFields);

  try {
    expect(filterFields(fullData, filteredFields)).to.deep.equal(
      snapshotData,
      `Snapshot does not match: ${snapshotPath}`,
    );
  } catch (error) {
    if (integrationConfig.get('overwriteSnapshots')) {
      await writeFile(snapshotPath, JSON.stringify(fullData, null, 2));
      throw new Error(`Snapshot updated: ${snapshotPath}`);
    }

    throw error;
  }
}
