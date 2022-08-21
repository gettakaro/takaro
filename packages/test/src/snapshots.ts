import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { JsonObject } from 'type-fest';
import { expect } from './test/expect';
import { omit } from 'lodash';
import { IntegrationTest } from './main';
import { Response } from 'supertest';

export interface ITestWithSnapshot {
  group: string;
  name: string;
  standardEnvironment?: boolean;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  run?(): Promise<void>;
  url: string | ((this: IntegrationTest) => string);
  method: 'get' | 'post' | 'put' | 'delete';
  body?: JsonObject;
  adminAuth?: boolean;
  expectedStatus?: number;
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
  test: ITestWithSnapshot,
  response: Response
) {
  const snapshotPath = path.resolve(
    __dirname,
    '__snapshots__',
    test.group,
    normalizePath(`${test.name}.json`)
  );
  let file = '';

  const fullData = {
    body: response.body,
    status: response.status,
    test: omit(test, 'setup', 'teardown', 'run'),
  };

  try {
    file = await readFile(snapshotPath, { encoding: 'utf-8' });
  } catch (error) {
    await mkdir(path.dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify(fullData, null, 2));
    console.error(error);
    throw new Error('No snapshot exists, created a new one');
  }

  const filteredFields = [
    ...DEFAULT_FILTERED_FIELDS,
    ...(test.filteredFields ?? []),
  ];
  const snapshotData = filterFields(JSON.parse(file), filteredFields);

  expect(filterFields(fullData, filteredFields)).to.deep.equal(snapshotData);
}
