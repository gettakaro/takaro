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
    author: 'Test Author',
    supportedGames: ['all'],
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
          moduleAuthor={mod.author}
          moduleSupportedGames={mod.supportedGames}
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
          moduleAuthor={mod.author}
          moduleSupportedGames={mod.supportedGames}
          moduleVersion={mod.latestVersion}
          error={null}
        />,
      );
      expect(getByText('Failed to parse config fields')).toBeDefined();
    });
  });
});
