import { beforeEach, describe, it } from 'vitest';
import { render } from 'test-utils';
import { ModuleForm } from '.';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';

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

describe('EditModule', () => {
  beforeEach(() => {
    // Add a div with the required ID to the document body
  });

  it('Should gracefully handle invalid configSchema', () => {
    const invalidSchema = JSON.stringify({ schema: 'invalid' });
    render(
      <ModuleForm
        onSubmit={() => {}}
        isLoading={false}
        mod={createModuleDTO({ configSchema: invalidSchema })}
        isSuccess={false}
        error={null}
      />
    );
  });
});
