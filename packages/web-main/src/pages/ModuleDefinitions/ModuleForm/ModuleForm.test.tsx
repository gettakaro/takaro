import { beforeEach, describe, it } from 'vitest';
import { render } from 'test-utils';
import { ModuleForm } from '.';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';

describe('EditModule', () => {
  beforeEach(() => {
    // Add a div with the required ID to the document body
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'drawer');
    document.body.appendChild(portalRoot);
  });

  it('Should gracefully handle invalid configSchema', () => {
    const mod: ModuleOutputDTO = {
      id: '123',
      name: 'test',
      description: 'module description',
      configSchema: JSON.stringify({ type: 'invalid' }),
      createdAt: DateTime.now().toISO()!,
      updatedAt: DateTime.now().toISO()!,
      hooks: [],
      cronJobs: [],
      commands: [],
      permissions: [],
      uiSchema: '',
      systemConfigSchema: '',
    };

    render(<ModuleForm onSubmit={() => {}} isLoading={false} mod={mod} isSuccess={false} error={null} />);
  });
});
