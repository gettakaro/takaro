import { describe, it, expect } from 'vitest';
import { schemaToInputs } from './SchemaToInputs';
import { InputType } from './inputTypes';
import { countryCodes } from 'components/selects/CountrySelect/countryCodes';

describe('schemaToInputs', () => {
  it('Should convert to empty array when no schema is provided', () => {
    const schema = {};
    const expected = [];
    expect(schemaToInputs(schema)).toEqual(expected);
  });

  it('Should set required', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'required field': {
          type: 'string',
          title: 'required field',
          description: 'This field is required',
        },
      },
      required: ['required field'],
      additionalProperties: false,
    };

    const expected = [
      {
        name: 'required field',
        type: InputType.string,
        required: true,
        default: undefined,
        description: 'This field is required',
        minLength: undefined,
        maxLength: undefined,
      },
    ];
    expect(schemaToInputs(schema)).toEqual(expected);
  });

  describe('String type', () => {
    it('Should convert basic string type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'string field': {
            type: 'string',
            title: 'string field',
            description: 'string field description',
            default: 'default value',
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'string field',
          type: InputType.string,
          required: false,
          default: 'default value',
          description: 'string field description',
          minLength: undefined,
          maxLength: undefined,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

    it('Should convert minimum and maximum length', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'string field': {
            type: 'string',
            title: 'string field',
            description: 'string field description',
            default: 'default value',
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'string field',
          type: InputType.string,
          required: false,
          default: 'default value',
          description: 'string field description',
          minLength: undefined,
          maxLength: undefined,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });

  describe('Number type', () => {
    it('Should convert basic number type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'number field': {
            type: 'number',
            title: 'number field',
            description: 'string field description',
            default: '0',
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'number field',
          type: InputType.number,
          required: false,
          default: '0',
          description: 'string field description',
          minimum: undefined,
          maximum: undefined,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

    it('Should convert number type with minimum and maximum', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'number field': {
            type: 'number',
            title: 'number field',
            description: 'string field description',
            minimum: 1,
            maximum: 10,
            default: 5,
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'number field',
          type: InputType.number,
          required: false,
          default: 5,
          description: 'string field description',
          minimum: 1,
          maximum: 10,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });

  describe('Array type', () => {
    it('Should convert basic array type', () => {
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
              type: 'string',
            },
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'array field',
          type: InputType.array,
          required: false,
          default: ['brunkel', 'cata', 'emiel'],
          description: 'array field description',
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

    it('Should convert unique Items, minItems and maxItems ', () => {
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
              type: 'string',
            },
            uniqueItems: true,
            minItems: 1,
            maxItems: 10,
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'array field',
          type: InputType.array,
          required: false,
          default: ['brunkel', 'cata', 'emiel'],
          uniqueItems: true,
          minItems: 1,
          maxItems: 10,
          description: 'array field description',
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

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
      expect(() => schemaToInputs(schema)).toThrowError('SchemaToInputs: property.items.type must be of type string');
    });
  });

  describe('Select type', () => {
    it('Should convert basic select type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'select field': {
            'x-component': InputType.select,
            type: 'string',
            title: 'select field',
            description: 'select field description',
            enum: ['cata', 'brunkel', 'emiel'],
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'select field',
          type: InputType.select,
          required: false,
          multiple: false,
          default: undefined,
          description: 'select field description',
          values: ['cata', 'brunkel', 'emiel'],
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

    it('Should convert select type with multiple', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'select field': {
            'x-component': InputType.select,
            type: 'array',
            uniqueItems: true,
            title: 'select field',
            description: 'select field description',
            items: {
              type: 'string',
              enum: ['cata', 'brunkel', 'emiel'],
              minItems: 1,
            },
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'select field',
          type: InputType.select,
          required: false,
          multiple: true,
          default: undefined,
          description: 'select field description',
          values: ['cata', 'brunkel', 'emiel'],
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });

  describe('Boolean type', () => {
    it('Should convert basic boolean type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'boolean field': {
            type: 'boolean',
            title: 'boolean field',
            description: 'boolean field description',
            default: false,
          },
        },
        required: [],
        additionalProperties: false,
      };
      const expected = [
        {
          name: 'boolean field',
          type: InputType.boolean,
          required: false,
          default: false,
          description: 'boolean field description',
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });

  describe('Duration type', () => {
    it('Should convert basic duration type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'duration field': {
            'x-component': InputType.duration,
            type: 'number',
            title: 'duration field',
            description: 'duration field description',
          },
        },
        required: [],
        additionalProperties: false,
      };
      const expected = [
        {
          name: 'duration field',
          type: InputType.duration,
          required: false,
          description: 'duration field description',
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });

  describe('Item type', () => {
    it('Should convert basic item type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'item field': {
            'x-component': InputType.item,
            type: 'string',
            title: 'item field',
            description: 'item field description',
          },
        },
        required: [],
        additionalProperties: false,
      };

      const expected = [
        {
          name: 'item field',
          type: InputType.item,
          description: 'item field description',
          required: false,
          multiple: false,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

    it('Should convert multiple item type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'item field': {
            'x-component': InputType.item,
            title: 'item field',
            description: 'item field description',
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'string',
            },
          },
        },
        required: [],
        additionalProperties: false,
      };
      const expected = [
        {
          name: 'item field',
          type: InputType.item,
          description: 'item field description',
          required: false,
          multiple: true,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });

  describe('Country type', () => {
    it('Should convert basic country type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'country field': {
            'x-component': InputType.country,
            title: 'country field',
            description: 'country field description',
            type: 'string',
            oneOf: countryCodes.map(({ code, name }) => ({ const: code, title: name })),
          },
        },
        required: [],
        additionalProperties: false,
      };
      const expected = [
        {
          name: 'country field',
          type: InputType.country,
          description: 'country field description',
          required: false,
          multiple: false,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });

    it('Should convert multiple country type', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          'country field': {
            'x-component': InputType.country,
            title: 'country field',
            description: 'country field description',
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'string',
              anyOf: countryCodes.map(({ code, name }) => ({ const: code, title: name })),
            },
          },
        },
        required: [],
        additionalProperties: false,
      };
      const expected = [
        {
          name: 'country field',
          type: InputType.country,
          description: 'country field description',
          required: false,
          multiple: true,
        },
      ];
      expect(schemaToInputs(schema)).toEqual(expected);
    });
  });
});
