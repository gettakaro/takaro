import { describe, it, expect } from 'vitest';
import { render } from 'test-utils';
import { ModuleForm } from '.';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';
import { validSchemas, invalidSchemas } from '../testData';

function createModuleDTO(overrides: Partial<ModuleOutputDTO> = {}): ModuleOutputDTO {
  return {
    id: '123',
    name: 'test',
    description: 'module description',
    configSchema: JSON.stringify({ type: 'valid' }), // Default to valid schema
    createdAt: DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
    hooks: [],
    cronJobs: [],
    commands: [],
    functions: [],
    permissions: [],
    uiSchema: '',
    systemConfigSchema: '',
    ...overrides, // Allows customization for specific tests
  };
}

describe('Render ConfigFields', () => {
  validSchemas.forEach((test) => {
    it(`Should render ${test.name} without errors`, () => {
      const { queryByRole } = render(
        <ModuleForm
          onSubmit={() => {}}
          isLoading={false}
          mod={createModuleDTO({ configSchema: JSON.stringify(test.schema) })}
          error={null}
        />,
      );
      expect(queryByRole('status')).toBeNull();
    });
  });

  invalidSchemas.forEach((test) => {
    it('Should show error when schema is invalid', () => {
      const { getByText } = render(
        <ModuleForm
          onSubmit={() => {}}
          isLoading={false}
          mod={createModuleDTO({ configSchema: JSON.stringify(test.schema) })}
          error={null}
        />,
      );
      expect(getByText('Failed to parse config fields')).toBeDefined();
    });
  });
});
