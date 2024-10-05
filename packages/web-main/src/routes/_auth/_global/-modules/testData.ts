import { InputType } from './schemaConversion/inputTypes';
import { SchemaObject } from 'ajv';
import { countryCodes } from 'components/selects/CountrySelectField/countryCodes';

type Test = {
  name: string;
  schema: SchemaObject;
  inputs: Record<string, unknown>[];
};

export const validSchemas: Test[] = [
  {
    name: 'required field',
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
        type: InputType.text,
        required: true,
        default: undefined,
        description: 'This field is required',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  {
    name: 'Basic boolean field',
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
  {
    name: 'string field',
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
        type: InputType.text,
        required: false,
        default: undefined,
        description: 'string field description',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  {
    name: 'string field with default value',
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
        type: InputType.text,
        required: false,
        default: 'default value',
        description: 'string field description',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  {
    name: '2 string fields',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'config field 1': {
          type: 'string',
          title: 'config field 1',
          description: 'string field description',
        },
        'config field 2': {
          type: 'string',
          title: 'config field 2',
          description: 'string field description',
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'config field 1',
        type: InputType.text,
        required: false,
        default: undefined,
        description: 'string field description',
        minLength: undefined,
        maxLength: undefined,
      },
      {
        name: 'config field 2',
        type: InputType.text,
        required: false,
        default: undefined,
        description: 'string field description',
        minLength: undefined,
        maxLength: undefined,
      },
    ],
  },
  {
    name: 'number field',
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
  {
    name: 'number field with default, min and max value',
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
  {
    name: 'array field with default value',
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
  {
    name: 'array field with default value, uniqueItems, minItems and maxItems',
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
  {
    name: 'enumeration field',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'enumeration field': {
          type: 'string',
          title: 'enumeration field',
          description: 'enumeration field description',
          enum: ['cata', 'brunkel', 'emiel'],
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'enumeration field',
        type: InputType.enumeration,
        required: false,
        multiple: false,
        default: undefined,
        description: 'enumeration field description',
        values: ['cata', 'brunkel', 'emiel'],
      },
    ],
  },
  {
    name: 'Multi enumeration field',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'enumeration field': {
          'x-component': InputType.enumeration,
          type: 'array',
          uniqueItems: true,
          title: 'enumeration field',
          description: 'enumeration field description',
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
        name: 'enumeration field',
        type: InputType.enumeration,
        required: false,
        multiple: true,
        default: undefined,
        description: 'enumeration field description',
        values: ['cata', 'brunkel', 'emiel'],
      },
    ],
  },
  {
    name: 'duration field',
    schema: {
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
  {
    name: 'item field',
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
  {
    name: 'item field with multiple',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'item field': {
          'x-component': InputType.item,
          type: 'array',
          title: 'item field',
          description: 'item field description',
          uniqueItems: true,
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
  {
    name: 'country field',
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
  {
    name: 'country field with multiple',
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
];

/*  These are valid schema that can be converted to inputs.
 * However, the inputs cannot be converted back to the original schema.
 * E.g. legacy schemas.
 */
//
export const validSchemasToInputs: Test[] = [
  {
    name: 'empty schema',
    schema: {},
    inputs: [],
  },
  {
    name: 'Legacy integer',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'number field': {
          type: 'integer',
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
  {
    name: 'schema without required property',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        sendPlayerConnected: {
          title: 'Send player connected',
          type: 'boolean',
          description: 'Send a message when a player connects.',
          default: true,
        },
      },
      required: undefined,
      additionalProperties: false,
    },
    inputs: [
      {
        name: 'sendPlayerConnected',
        type: InputType.boolean,
        required: false,
        description: 'Send a message when a player connects.',
        default: true,
      },
    ],
  },
];

export const invalidSchemas: Test[] = [
  {
    name: 'Schema should start with an object',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string',
    },
    inputs: [],
  },
  {
    name: 'array field with items.type != string',
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
            type: 'number',
          },
        },
      },
      required: [],
      additionalProperties: false,
    },
    inputs: [],
  },
];
