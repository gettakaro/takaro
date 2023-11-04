import { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  CollapseList,
  styled,
  JsonSchemaForm,
  DrawerSkeleton,
  FormError,
} from '@takaro/lib-components';
import Form from '@rjsf/core';

import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import { useGameServerModuleInstall, useGameServerModuleInstallation } from 'queries/gameservers';
import { useModule } from 'queries/modules';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const InstallModule: FC = () => {
  const [open, setOpen] = useState(true);
  const [userConfigSubmitted, setUserConfigSubmitted] = useState(false);
  const [systemConfigSubmitted, setSystemConfigSubmitted] = useState(false);
  const navigate = useNavigate();
  const { mutate, isLoading, error, isSuccess } = useGameServerModuleInstall();
  const { serverId, moduleId } = useParams();
  const { data: mod, isLoading: moduleLoading } = useModule(moduleId!);
  const { data: modInstallation, isLoading: moduleInstallationLoading } = useGameServerModuleInstallation(
    serverId!,
    moduleId!
  );

  const [userConfig, setUserConfig] = useState<Record<string, unknown>>({});
  const [systemConfig, setSystemConfig] = useState<Record<string, unknown>>({});

  const userConfigFormRef = useRef<Form>(null);
  const systemConfigFormRef = useRef<Form>(null);

  if (!serverId || !moduleId) {
    throw new Error('No serverId or moduleId');
  }

  const onUserConfigSubmit = ({ formData }, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserConfig(formData);
    setUserConfigSubmitted(true);
  };

  const onSystemConfigSubmit = ({ formData }, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSystemConfig(formData);
    setSystemConfigSubmitted(true);
  };

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServer.modules(serverId));
    }
  }, [open, navigate, serverId]);

  const onSubmit = useCallback(async () => {
    mutate({
      gameServerId: serverId,
      moduleId: moduleId,
      moduleInstall: {
        systemConfig: JSON.stringify(systemConfig),
        userConfig: JSON.stringify(userConfig),
      },
    });
  }, [moduleId, navigate, serverId, systemConfig, userConfig]);

  useEffect(() => {
    if (isSuccess) {
      navigate(PATHS.gameServer.modules(serverId));
    }
  }, [isSuccess]);

  useEffect(() => {
    if (userConfig && systemConfig && userConfigSubmitted && systemConfigSubmitted) {
      onSubmit();
      setUserConfigSubmitted(false);
      setSystemConfigSubmitted(false);
    }
  }, [userConfigSubmitted, systemConfigSubmitted, userConfig, systemConfig]);

  if (moduleLoading || moduleInstallationLoading) {
    return <DrawerSkeleton />;
  }

  const isInstalled = modInstallation?.createdAt !== undefined;
  const actionType = isInstalled ? 'Update' : 'Install';

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>{actionType} Module</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="User config">
              <JsonSchemaForm
                schema={JSON.parse(mod?.configSchema as string)}
                uiSchema={{}}
                initialData={modInstallation?.userConfig || userConfig}
                hideSubmitButton
                onSubmit={onUserConfigSubmit}
                ref={userConfigFormRef}
              />
            </CollapseList.Item>
            <CollapseList.Item title="System config">
              <JsonSchemaForm
                schema={JSON.parse(mod?.systemConfigSchema as string)}
                uiSchema={{}}
                initialData={modInstallation?.systemConfig || systemConfig}
                hideSubmitButton
                onSubmit={onSystemConfigSubmit}
                ref={systemConfigFormRef}
              />
            </CollapseList.Item>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          {error && <FormError error={error} />}
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button
              fullWidth
              isLoading={isLoading}
              text={actionType}
              type="button"
              onClick={() => {
                systemConfigFormRef.current?.formElement.current.requestSubmit();
                userConfigFormRef.current?.formElement.current.requestSubmit();
              }}
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default InstallModule;
