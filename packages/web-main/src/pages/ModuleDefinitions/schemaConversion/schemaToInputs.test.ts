import { describe, it, expect } from 'vitest';
import { schemaToInputs } from './SchemaToInputs';
import { testData } from './testData';
import { Input } from './inputTypes';

describe('schemaToInputs', () => {
  const testSchemaToInputs = (testKey: keyof typeof testData) => {
    it(`Should convert ${testData[testKey].description}`, () => {
      const { schema, inputs } = testData[testKey];
      expect(schemaToInputs(schema).inputs).toEqual(inputs as unknown as Input[]);
    });
  };

  it('Should throw error when schema does not start from an object', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
    };
    const errors = schemaToInputs(schema).errors;
    expect(errors).toHaveLength(1);
  });

  it('Should throw error when schema does not contain any properties', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
    };
    const errors = schemaToInputs(schema).errors;
    expect(errors).toHaveLength(1);
  });

  it('Should convert to empty array when no schema is provided', () => {
    expect(schemaToInputs({}).inputs).toEqual([]);
  });

  testSchemaToInputs('required');

  describe('String type', () => {
    testSchemaToInputs('string');
    testSchemaToInputs('stringExtended');
  });

  describe('Number type', () => {
    testSchemaToInputs('number');
    testSchemaToInputs('numberExtended');
  });

  describe('Array type', () => {
    testSchemaToInputs('array');
    testSchemaToInputs('arrayExtended');

    it('Should throw error when property.items.type != string', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'array field': {
            type: 'array',
            title: 'array field',
            description: 'array field description',
            default: ['brunkel', 'cata', 'emiel'],
            items: {
              type: 'number',
            },
          },
        },
        required: [],
        additionalProperties: false,
      };

      const errors = schemaToInputs(schema).errors;
      expect(errors).toHaveLength(1);
    });
  });

  describe('Select type', () => {
    testSchemaToInputs('select');
    testSchemaToInputs('selectExtended');
  });

  describe('Boolean type', () => {
    testSchemaToInputs('boolean');
  });

  describe('Duration type', () => {
    testSchemaToInputs('duration');
  });

  describe('Item type', () => {
    testSchemaToInputs('item');
    testSchemaToInputs('itemExtended');
  });

  describe('Country type', () => {
    testSchemaToInputs('country');
    testSchemaToInputs('countryExtended');
  });
});
