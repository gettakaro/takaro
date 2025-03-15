import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { JsonObject } from 'type-fest';
import { expect } from './test/expect.js';
import { omit, isEqual } from 'lodash-es';
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
  'moduleVersionId',
  'versionId',
];

// Helper to get differences between two objects, ignoring filtered fields
function getDifferences(
  current: unknown,
  snapshot: unknown,
  filteredFields: string[],
  path: string[] = [],
): Array<{ path: string[]; current: unknown; snapshot: unknown }> {
  // For filtered fields, no differences should be recorded
  if (filteredFields.includes(path[path.length - 1])) {
    return [];
  }

  // If values are equal, no differences
  if (isEqual(current, snapshot)) {
    return [];
  }

  // Handle arrays
  if (Array.isArray(current) && Array.isArray(snapshot)) {
    const differences: Array<{ path: string[]; current: unknown; snapshot: unknown }> = [];
    const maxLength = Math.max(current.length, snapshot.length);

    for (let i = 0; i < maxLength; i++) {
      differences.push(...getDifferences(current[i], snapshot[i], filteredFields, [...path, i.toString()]));
    }

    return differences;
  }

  // Handle objects
  if (typeof current === 'object' && current !== null && typeof snapshot === 'object' && snapshot !== null) {
    const differences: Array<{ path: string[]; current: unknown; snapshot: unknown }> = [];
    const allKeys = new Set([...Object.keys(current as JsonObject), ...Object.keys(snapshot as JsonObject)]);

    for (const key of allKeys) {
      // Skip filtered fields entirely
      if (filteredFields.includes(key)) continue;

      const currentValue = (current as JsonObject)[key];
      const snapshotValue = (snapshot as JsonObject)[key];

      differences.push(...getDifferences(currentValue, snapshotValue, filteredFields, [...path, key]));
    }

    return differences;
  }

  // Values are different and not objects/arrays
  return [{ path, current, snapshot }];
}

function mergeWithSnapshot(
  current: unknown,
  snapshot: unknown,
  differences: Array<{ path: string[]; current: unknown }>,
  filteredFields: string[],
): unknown {
  // Start with a deep clone of the snapshot to preserve all filtered fields
  const result = JSON.parse(JSON.stringify(snapshot));

  // Only update non-filtered fields that have differences
  for (const { path, current: newValue } of differences) {
    // Skip if the path ends with a filtered field
    if (filteredFields.includes(path[path.length - 1])) {
      continue;
    }

    let target = result;

    // Navigate to the parent of the target property
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in target)) {
        target[key] = typeof path[i + 1] === 'number' ? [] : {};
      }
      target = target[key];
    }

    // Update only if it's not a filtered field
    const lastKey = path[path.length - 1];
    if (!filteredFields.includes(lastKey)) {
      target[lastKey] = newValue;
    }
  }

  return result;
}

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
  let existingSnapshot: unknown;

  const fullData = {
    body: response.data,
    status: response.status,
    test: omit(test, 'setup', 'teardown', 'test', 'attempts'),
  };

  try {
    const file = await readFile(snapshotPath, { encoding: 'utf-8' });
    existingSnapshot = JSON.parse(file);
  } catch {
    // No snapshot exists, create a new one
    await mkdir(path.dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, JSON.stringify(fullData, null, 2));
    throw new Error(`No snapshot exists, created a new one: ${snapshotPath}`);
  }

  const filteredFields = [...DEFAULT_FILTERED_FIELDS, ...(test.filteredFields ?? [])];
  const snapshotData = filterFields(existingSnapshot, filteredFields);

  try {
    expect(filterFields(fullData, filteredFields)).to.deep.equal(
      snapshotData,
      `Snapshot does not match: ${snapshotPath}`,
    );
  } catch (error) {
    if (integrationConfig.get('overwriteSnapshots')) {
      // Get the differences between current and snapshot (ignoring filtered fields)
      const differences = getDifferences(fullData, existingSnapshot, filteredFields);

      // Merge changes while preserving filtered fields from original snapshot
      const updatedSnapshot = mergeWithSnapshot(fullData, existingSnapshot, differences, filteredFields);

      // Write the merged snapshot
      await writeFile(snapshotPath, JSON.stringify(updatedSnapshot, null, 2));

      // Report only non-filtered field changes
      const changedPaths = differences
        .map((d) => d.path.join('.'))
        .filter((path) => !filteredFields.includes(path.split('.').pop()!));

      throw new Error(`Snapshot updated: ${snapshotPath}\nChanged fields: ${changedPaths.join(', ')}`);
    }
    throw error;
  }
}
