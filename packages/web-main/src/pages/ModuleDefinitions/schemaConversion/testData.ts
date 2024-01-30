import { InputType } from './inputTypes';
import { SchemaObject } from 'ajv';
import { countryCodes } from 'components/selects/CountrySelect/countryCodes';

type TestData = Record<
  string,
  {
    description: string;
    schema: SchemaObject;
    inputs: Record<string, unknown>[];
  }
>;

export const testData: TestData = {
  required: {
    description: 'required field',
    schema: {
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
    },
    inputs: [
      {
        name: 'required field',
        type: InputType.string,
        required: true,
        default: undefined,
        description: 'This field is required',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  boolean: {
    description: 'Basic boolean field',
    schema: {
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
    },
    inputs: [
      {
        name: 'boolean field',
        type: InputType.boolean,
        required: false,
        default: false,
        description: 'boolean field description',
      },
    ],
  },
  string: {
    description: 'string field',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'string field': {
          type: 'string',
          title: 'string field',
          description: 'string field description',
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'string field',
        type: InputType.string,
        required: false,
        default: undefined,
        description: 'string field description',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  stringExtended: {
    description: 'string field with default value',
    schema: {
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
    },
    inputs: [
      {
        name: 'string field',
        type: InputType.string,
        required: false,
        default: 'default value',
        description: 'string field description',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  number: {
    description: 'number field',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'number field': {
          type: 'number',
          title: 'number field',
          description: 'string field description',
          default: 0,
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'number field',
        type: InputType.number,
        required: false,
        default: 0,
        description: 'string field description',
        minimum: undefined,
        maximum: undefined,
      },
    ],
  },
  numberExtended: {
    description: 'number field with default, min and max value',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'number field': {
          type: 'number',
          title: 'number field',
          description: 'number field description',
          minimum: 1,
          maximum: 10,
          default: 5,
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'number field',
        type: InputType.number,
        required: false,
        description: 'number field description',
        default: 5,
        minimum: 1,
        maximum: 10,
      },
    ],
  },
  array: {
    description: 'array field with default value',
    schema: {
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
    },
    inputs: [
      {
        name: 'array field',
        type: InputType.array,
        required: false,
        default: ['brunkel', 'cata', 'emiel'],
        description: 'array field description',
      },
    ],
  },
  arrayExtended: {
    description: 'array field with default value, uniqueItems, minItems and maxItems',
    schema: {
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
    },
    inputs: [
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
    ],
  },
  select: {
    description: 'select field',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'select field': {
          type: 'string',
          title: 'select field',
          description: 'select field description',
          enum: ['cata', 'brunkel', 'emiel'],
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'select field',
        type: InputType.select,
        required: false,
        multiple: false,
        default: undefined,
        description: 'select field description',
        values: ['cata', 'brunkel', 'emiel'],
      },
    ],
  },
  selectExtended: {
    description: 'Multiselect field',
    schema: {
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
          },
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'select field',
        type: InputType.select,
        required: false,
        multiple: true,
        default: undefined,
        description: 'select field description',
        values: ['cata', 'brunkel', 'emiel'],
      },
    ],
  },
  duration: {
    description: 'duration field',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'duration field': {
          'x-component': InputType.duration,
          type: 'number',
          title: 'duration field',
          description: 'duration field description',
          minimum: 1, // should atleast be 1 millisecond.
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'duration field',
        type: InputType.duration,
        required: false,
        description: 'duration field description',
      },
    ],
  },
  item: {
    description: 'item field',
    schema: {
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
    },
    inputs: [
      {
        name: 'item field',
        type: InputType.item,
        description: 'item field description',
        required: false,
        multiple: false,
      },
    ],
  },
  itemExtended: {
    description: 'item field with multiple',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'item field': {
          'x-component': InputType.item,
          type: 'array',
          uniqueItems: true,
          title: 'item field',
          description: 'item field description',
          items: {
            type: 'string',
          },
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'item field',
        type: InputType.item,
        description: 'item field description',
        required: false,
        multiple: true,
      },
    ],
  },
  country: {
    description: 'country field',
    schema: {
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
    },
    inputs: [
      {
        name: 'country field',
        type: InputType.country,
        description: 'country field description',
        required: false,
        multiple: false,
      },
    ],
  },
  countryExtended: {
    description: 'country field with multiple',
    schema: {
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
    },
    inputs: [
      {
        name: 'country field',
        type: InputType.country,
        description: 'country field description',
        required: false,
        multiple: true,
      },
    ],
  },
};
