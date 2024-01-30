import { describe, it, expect } from 'vitest';
import { testData } from '../testData';
import { inputsToSchema } from './inputsToSchema';
import { Input } from './inputTypes';

describe('schemaToInputs', () => {
  const testInputsToSchema = (testKey: keyof typeof testData) => {
    it(`Should convert ${testData[testKey].description}`, () => {
      const { schema, inputs } = testData[testKey];
      expect(inputsToSchema(inputs as unknown as Input[])).toEqual(schema);
    });
  };

  testInputsToSchema('required');

  describe('String type', () => {
    testInputsToSchema('string');
    testInputsToSchema('stringExtended');
  });

  describe('Number type', () => {
    testInputsToSchema('number');
    testInputsToSchema('numberExtended');
  });

  describe('Array type', () => {
    testInputsToSchema('array');
    testInputsToSchema('arrayExtended');
  });

  describe('Select type', () => {
    testInputsToSchema('select');
    testInputsToSchema('selectExtended');
  });

  describe('Boolean type', () => {
    testInputsToSchema('boolean');
  });

  describe('Duration type', () => {
    testInputsToSchema('duration');
  });

  describe('Item type', () => {
    testInputsToSchema('item');
    testInputsToSchema('itemExtended');
  });

  describe('Country type', () => {
    testInputsToSchema('country');
    testInputsToSchema('countryExtended');
  });
});
