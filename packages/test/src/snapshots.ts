import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { JsonObject } from 'type-fest';
import { expect } from './test/expect';
import { omit } from 'lodash';

export interface ITestWithSnapshot {
  name: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  url: string;
  method: 'get' | 'post' | 'put' | 'delete';
  body?: JsonObject;
}

function normalizePath(path: string) {
  return path.split('/').join('');
}

// These are fields that are allowed to be different in snapshots
const FILTERED_FIELDS = ['createdAt', 'updatedAt', 'id', 'serverTime'];

function filterFields(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => filterFields(item));
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data as JsonObject)
        .filter(([key]) => !FILTERED_FIELDS.includes(key))
        .map(([key, value]) => [key, filterFields(value)])
    );
  }
  return data;
}

export async function matchSnapshot(test: ITestWithSnapshot, data: JsonObject) {
  const snapshotPath = path.resolve(
    __dirname,
    '__snapshots__',
    normalizePath(`${test.name}.json`)
  );
  let file = '';

  const fullData = { data, test: omit(test, 'setup') };

  try {
    file = await readFile(snapshotPath, { encoding: 'utf-8' });
  } catch (error) {
    await writeFile(snapshotPath, JSON.stringify(fullData, null, 2));
    console.error(error);
    throw new Error('No snapshot exists, created a new one');
  }

  const snapshotData = filterFields(JSON.parse(file));

  expect(filterFields(fullData)).to.deep.equal(snapshotData);
}
