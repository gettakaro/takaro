import { describe, it, expect } from 'vitest';
import { render } from '../../../../../../testUtils';
import { ModuleFormBuilder } from '.';
import { ModuleOutputDTO, ModuleVersionOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';
import { validSchemas, invalidSchemas } from '../ModuleDTOTestData';

function createModuleDTO(moduleVersionOverrides: Partial<ModuleVersionOutputDTO> = {}): ModuleOutputDTO {
  return {
    id: 'module-123',
    name: 'test',
    latestVersion: {
      createdAt: DateTime.now().toISO(),
      updatedAt: DateTime.now().toISO(),
      id: 'version-123',
      moduleId: 'module-123',
      description: 'version description',
      configSchema: JSON.stringify({ type: 'valid' }), // Default to valid schema
      hooks: [],
      cronJobs: [],
      commands: [],
      functions: [],
      permissions: [],
      uiSchema: '',
      systemConfigSchema: '',
      tag: 'latest',
      ...moduleVersionOverrides,
    },
    versions: [
      {
        createdAt: DateTime.now().toISO(),
        updatedAt: DateTime.now().toISO(),
        tag: 'latest',
        id: 'version-123',
      },
    ],
    createdAt: DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  };
}

describe('Render ConfigFields', () => {
  validSchemas.forEach((test) => {
    it(`Should render ${test.name} without errors`, () => {
      const mod = createModuleDTO({ configSchema: JSON.stringify(test.schema) });

      const { queryByRole } = render(
        <ModuleFormBuilder
          onSubmit={() => {}}
          isLoading={false}
          moduleName={mod.name}
          moduleVersion={mod.latestVersion}
          error={null}
        />,
      );
      expect(queryByRole('status')).toBeNull();
    });
  });

  invalidSchemas.forEach((test) => {
    it.skip(`Should show error when schema is invalid: ${test.schema.id}`, () => {
      const mod = createModuleDTO({ configSchema: JSON.stringify(test.schema) });
      const { getByText } = render(
        <ModuleFormBuilder
          onSubmit={() => {}}
          isLoading={false}
          moduleName={mod.name}
          moduleVersion={mod.latestVersion}
          error={null}
        />,
      );
      expect(getByText('Failed to parse config fields')).toBeDefined();
    });
  });
});
