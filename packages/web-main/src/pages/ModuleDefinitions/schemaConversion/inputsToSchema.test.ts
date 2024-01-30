import { describe, it, expect } from 'vitest';
import { invalidSchemas, validSchemas } from '../testData';
import { inputsToSchema } from './inputsToSchema';
import { Input } from './inputTypes';

describe('schemaToInputs', () => {
  validSchemas.forEach((test) => {
    it(`should convert ${test.name} inputs to schema`, () => {
      expect(inputsToSchema(test.inputs as unknown as Input[])).toEqual(test.schema);
    });
  });

  invalidSchemas.forEach((test) => {
    it(`should convert ${test.name} schema to inputs`, () => {
      expect(inputsToSchema(test as unknown as Input[])).toEqual(test.schema);
    });
  });
});
