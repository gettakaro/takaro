import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { JsonObject } from 'type-fest';
import { expect } from './test/expect';
import { omit } from 'lodash';
import { ITakaroAPIAxiosResponse } from '@takaro/apiclient';
import { IntegrationTest } from './main';
import { IIntegrationTest } from './integrationTest';

export class ITestWithSnapshot<SetupData> extends IIntegrationTest<SetupData> {
  snapshot = true;
  group!: string;
  name!: string;
  standardEnvironment?: boolean = true;
  setup?: (this: IntegrationTest<SetupData>) => Promise<SetupData>;
  teardown?: (this: IntegrationTest<SetupData>) => Promise<void>;
  test!: (
    this: IntegrationTest<SetupData>
  ) => Promise<ITakaroAPIAxiosResponse<unknown>>;
  expectedStatus?: number = 200;
  filteredFields?: string[];
}

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
];

function filterFields(
  data: unknown,
  filteredFields = DEFAULT_FILTERED_FIELDS
): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => filterFields(item, filteredFields));
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data as JsonObject)
        .filter(([key]) => !filteredFields.includes(key))
        .map(([key, value]) => [key, filterFields(value, filteredFields)])
    );
  }
  return data;
}

export async function matchSnapshot(
  test: ITestWithSnapshot<unknown>,
  response: ITakaroAPIAxiosResponse<unknown>
) {
  const snapshotPath = path.resolve(
    __dirname,
    '__snapshots__',
    test.group,
    normalizePath(`${test.name}.json`)
  );
  let file = '';

  const fullData = {
    body: response.data,
    status: response.status,
    test: omit(test, 'setup', 'teardown', 'test'),
  };

  try {
    file = await readFile(snapshotPath, { encoding: 'utf-8' });
  } catch (error) {
    await mkdir(path.dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify(fullData, null, 2));
    throw new Error('No snapshot exists, created a new one');
  }

  const filteredFields = [
    ...DEFAULT_FILTERED_FIELDS,
    ...(test.filteredFields ?? []),
  ];
  const snapshotData = filterFields(JSON.parse(file), filteredFields);

  expect(filterFields(fullData, filteredFields)).to.deep.equal(snapshotData);
}
