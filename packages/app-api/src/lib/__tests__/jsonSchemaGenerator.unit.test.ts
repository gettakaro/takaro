import { expect } from '@takaro/test';
import { generateJSONSchema, InputType } from '../jsonSchemaGenerator.js';
import Ajv from 'ajv';

describe('JsonSchemaGenerator', () => {
  it('Can do a basic text input', async () => {
    const schema = await generateJSONSchema([
      {
        name: 'test',
        type: InputType.string,
      },
    ]);

    expect(schema).to.deep.eq({
      type: 'object',
      properties: {
        test: {
          type: 'string',
        },
      },
    });
  });

  it('Can do a basic number input', async () => {
    const schema = await generateJSONSchema([
      {
        name: 'test',
        type: InputType.number,
      },
    ]);

    expect(schema).to.deep.eq({
      type: 'object',
      properties: {
        test: {
          type: 'number',
        },
      },
    });
  });

  it('Can do a basic enum input', async () => {
    const schema = await generateJSONSchema([
      {
        name: 'test',
        type: InputType.enum,
        enum: ['test1', 'test2'],
      },
    ]);

    expect(schema).to.deep.eq({
      type: 'object',
      properties: {
        test: {
          type: 'enum',
          enum: ['test1', 'test2'],
        },
      },
    });
  });

  it('Can do a basic boolean input', async () => {
    const schema = await generateJSONSchema([
      {
        name: 'test',
        type: InputType.boolean,
      },
    ]);

    expect(schema).to.deep.eq({
      type: 'object',
      properties: {
        test: {
          type: 'boolean',
        },
      },
    });
  });
});

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
          minimum: 1,
          maximum: 10,
        },
      ],
      validInputs: [{ 'Max teleports': 1 }, { 'Max teleports': 2 }],
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
      ],
    },
  ];

  for (const positiveTest of positives) {
    describe(`${positiveTest.name}`, () => {
      it('Can generate the schema', async () => {
        const schema = await generateJSONSchema(positiveTest.schemaData);
        new Ajv.default().compile(schema);
      });

      for (const validInput of positiveTest.validInputs) {
        it(`Validates valid input: ${JSON.stringify(validInput)}`, async () => {
          const schema = await generateJSONSchema(positiveTest.schemaData);
          const validator = new Ajv.default({ useDefaults: true }).compile(
            schema
          );
          const result = validator(validInput);
          expect(result).to.eq(
            true,
            `Input ${JSON.stringify(validInput)} failed validation`
          );
        });
      }

      for (const invalidInput of positiveTest.invalidInputs) {
        it(`Detects invalid input: ${JSON.stringify(
          invalidInput
        )} `, async () => {
          const schema = await generateJSONSchema(positiveTest.schemaData);
          const validator = new Ajv.default().compile(schema);
          expect(validator(invalidInput)).to.eq(
            false,
            `Input ${JSON.stringify(invalidInput)} passed validation`
          );
        });
      }
    });
  }
});
