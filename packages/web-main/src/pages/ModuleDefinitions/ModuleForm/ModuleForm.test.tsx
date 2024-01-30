import { describe, it, expect } from 'vitest';
import { render } from 'test-utils';
import { ModuleForm } from '.';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';
import { testData } from '../testData';

const testSchemaToInputRender = (testKey: keyof typeof testData) => {
  it(`Should convert ${testData[testKey].description}`, () => {
    const { schema } = testData[testKey];

    render(
      <ModuleForm
        onSubmit={() => {}}
        isLoading={false}
        mod={createModuleDTO({ configSchema: JSON.stringify(schema) })}
        isSuccess={false}
        error={null}
      />
    );
  });
};

function createModuleDTO(overrides: Partial<ModuleOutputDTO> = {}): ModuleOutputDTO {
  return {
    id: '123',
    name: 'test',
    description: 'module description',
    configSchema: JSON.stringify({ type: 'valid' }), // Default to valid schema
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
    hooks: [],
    cronJobs: [],
    commands: [],
    permissions: [],
    uiSchema: '',
    systemConfigSchema: '',
    ...overrides, // Allows customization for specific tests
  };
}

describe('Render ConfigFields', () => {
  it('Should show error when schema is invalid', () => {
    const invalidSchema = JSON.stringify({ schema: 'invalid' });
    const { getByText } = render(
      <ModuleForm
        onSubmit={() => {}}
        isLoading={false}
        mod={createModuleDTO({ configSchema: invalidSchema })}
        isSuccess={false}
        error={null}
      />
    );
    expect(getByText('Failed to parse config fields')).toBeDefined();
  });

  describe('String type', () => {
    testSchemaToInputRender('string');
    testSchemaToInputRender('stringExtended');
  });

  describe('Number type', () => {
    testSchemaToInputRender('number');
    testSchemaToInputRender('numberExtended');
  });

  describe('Array type', () => {
    testSchemaToInputRender('array');
    testSchemaToInputRender('arrayExtended');
  });

  describe('Select type', () => {
    testSchemaToInputRender('select');
    testSchemaToInputRender('selectExtended');
  });

  describe('Boolean type', () => {
    testSchemaToInputRender('boolean');
  });

  describe('Duration type', () => {
    testSchemaToInputRender('duration');
  });

  describe('Item type', () => {
    testSchemaToInputRender('item');
    testSchemaToInputRender('itemExtended');
  });

  describe('Country type', () => {
    testSchemaToInputRender('country');
    testSchemaToInputRender('countryExtended');
  });
});
