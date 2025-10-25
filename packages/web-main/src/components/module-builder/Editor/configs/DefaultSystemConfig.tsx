import { FC, useRef } from 'react';
import { Alert, Collapsible } from '@takaro/lib-components';
import { moduleVersionQueryOptions, useModuleUpdate } from '../../../../queries/module';
import { ConfigLoading } from './ConfigLoading';
import { useQuery } from '@tanstack/react-query';
import { JsonSchemaForm } from '../../../../components/JsonSchemaForm';

interface SystemConfigProps {
  moduleId: string;
  versionId: string;
  readOnly?: boolean;
}

export const SystemConfig: FC<SystemConfigProps> = ({ moduleId, versionId, readOnly = false }) => {
  const {
    data: modVersion,
    isPending: isLoadingVersion,
    isError: isVersionError,
  } = useQuery(moduleVersionQueryOptions(versionId));

  const systemConfigFormRef = useRef(null);
  const { mutateAsync, error } = useModuleUpdate();

  if (isLoadingVersion) {
    return <ConfigLoading />;
  }

  if (isVersionError) {
    return <Alert variant="error" text="Failed to load system configuration" />;
  }

  // Get system config from installation or version default
  const systemConfig = modVersion?.defaultSystemConfig || {};

  const onSystemConfigSubmit = async (data: any) => {
    console.log(data);
    try {
      await mutateAsync({
        id: moduleId,
        moduleUpdate: { latestVersion: { defaultSystemConfig: JSON.stringify(data.formData) } },
      });
    } catch (err) {
      console.error('Failed to update system config', err);
    }
  };

  return (
    <>
      <Collapsible>
        <Collapsible.Trigger>What is a default system config?</Collapsible.Trigger>
        <Collapsible.Content>
          As a module developer, you can define a default system configuration for your module. This configuration will
          be used as the default when a user installs your module. Users can override this configuration after
          installation. You can use this to set default aliases for commands, delays/cooldowns on hooks, ...
        </Collapsible.Content>
      </Collapsible>
      <JsonSchemaForm
        readOnly={readOnly}
        schema={JSON.parse(modVersion?.systemConfigSchema as string)}
        uiSchema={{}}
        initialData={systemConfig}
        onSubmit={onSystemConfigSubmit}
        ref={systemConfigFormRef}
      />

      {error && <Alert variant="error" text={`Failed to save system config: ${error}`} />}
    </>
  );
};
