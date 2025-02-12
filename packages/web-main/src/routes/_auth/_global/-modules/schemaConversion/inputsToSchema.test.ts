import { describe, it, expect } from 'vitest';
import { validSchemas } from '../ModuleForm/ModuleDTOTestData';
import { inputsToSchema } from './inputsToSchema';
import { AnyInput } from './inputTypes';

describe('schemaToInputs', () => {
  validSchemas.forEach((test) => {
    it(`should convert ${test.name} inputs to schema`, () => {
      expect(inputsToSchema(test.inputs as unknown as AnyInput[])).toEqual(test.schema);
    });
  });
});
