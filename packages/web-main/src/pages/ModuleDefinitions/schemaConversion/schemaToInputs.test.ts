import { describe, it, expect } from 'vitest';
import { schemaToInputs } from './SchemaToInputs';
import { validSchemas, invalidSchemas } from '../testData';

describe('schemaToInputs', () => {
  validSchemas.forEach((test) => {
    it(`Should convert ${test.name} schema to inputs`, () => {
      expect(schemaToInputs(test.schema).inputs).toEqual(test.inputs);
    });
  });

  invalidSchemas.forEach((test) => {
    it(`Should fail to convert ${test.name} schema to inputs`, () => {
      expect(schemaToInputs(test.schema).errors).toHaveLength(1);
    });
  });
});
