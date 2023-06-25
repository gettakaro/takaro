/* eslint-disable no-loop-func */
import { describe, it, expect } from 'vitest';
import { generateJSONSchema, InputType } from './index';
import Ajv, { AnySchema, ValidateFunction } from 'ajv';

interface IDataTest {
  name: string;
  schemaData: Parameters<typeof generateJSONSchema>[0];
  validInputs: Record<string, unknown>[];
  invalidInputs: Record<string, unknown>[];
}

describe('JsonSchemaGenerator#data', () => {
  const positives: IDataTest[] = [
    {
      name: 'Numbers',
      schemaData: [
        {
          name: 'Max teleports',
          type: InputType.number,
          default: 3,
          minimum: 1,
          maximum: 10,
        },
      ],
      validInputs: [{ 'Max teleports': 1 }, { 'Max teleports': 2 }, {}],
      invalidInputs: [
        { 'Max teleports': '1' },
        { 'Max teleports': true },
        { 'Max teleports': null },
        { 'Max teleports': 0 },
        { 'Max teleports': 11 },
      ],
    },
    {
      name: 'Array of strings',
      schemaData: [
        {
          name: 'messages',
          type: InputType.array,
          items: {
            type: InputType.string,
            minLength: 3,
            maxLength: 5,
          },
        },
      ],
      validInputs: [{ messages: ['test'] }, { messages: ['test', 'test2'] }],
      invalidInputs: [
        { messages: 'test' },
        { messages: [1] },
        { messages: 1 },
        { messages: [true] },
        { messages: true },
        { messages: [null] },
        { messages: null },
        { messages: ['too long!'] },
        { messages: ['a'] },
        {},
      ],
    },
  ];

  for (const positiveTest of positives) {
    let schema: AnySchema;
    let validator: ValidateFunction;
    describe(`${positiveTest.name}`, () => {
      it('Can generate the schema', async () => {
        schema = await generateJSONSchema(positiveTest.schemaData);
        validator = new Ajv({ useDefaults: true }).compile(schema);
      });

      it.each(positiveTest.validInputs)(
        'Validates valid input: %s',
        async (validInput) => {
          const result = validator(validInput);
          expect(result).toEqual(true);
        }
      );

      it.each(positiveTest.invalidInputs)(
        'Detects invalid input: %s',
        async (validInput) => {
          const result = validator(validInput);
          expect(result).toEqual(false);
        }
      );
    });
  }
});
