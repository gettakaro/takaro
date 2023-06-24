import { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  CollapseList,
  styled,
  JsonSchemaForm,
  Loading,
} from '@takaro/lib-components';
import Form from '@rjsf/core';

import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { useGameServerModuleInstall } from 'queries/gameservers';
import { useModule } from 'queries/modules';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const InstallModule: FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useGameServerModuleInstall();
  const { serverId, moduleId } = useParams();
  const { data: mod, isLoading: moduleLoading } = useModule(moduleId!);

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
  };

  const onSystemConfigSubmit = (
    { formData },
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSystemConfig(formData);
  };

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServer.modules(serverId));
    }
  }, [open, navigate, serverId]);

  const onSubmit = useCallback(async () => {
    try {
      mutateAsync({
        gameServerId: serverId,
        moduleId: moduleId,
        moduleInstall: {
          systemConfig: JSON.stringify({}),
          userConfig: JSON.stringify({}),
        },
      });

      navigate(PATHS.gameServer.modules(serverId));
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [moduleId, mutateAsync, navigate, serverId]);

  useEffect(() => {
    if (
      Object.keys(userConfig).length > 0 &&
      Object.keys(systemConfig).length > 0
    ) {
      onSubmit();
    }
  }, [userConfig, systemConfig, onSubmit]);

  if (moduleLoading) {
    return <Loading />;
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Install Module</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="User config">
              <JsonSchemaForm
                schema={JSON.parse(mod?.configSchema as string)}
                uiSchema={{}}
                initialData={{}}
                hideSubmitButton
                onSubmit={onUserConfigSubmit}
                ref={userConfigFormRef}
              />
            </CollapseList.Item>
            <CollapseList.Item title="System config">
              <JsonSchemaForm
                schema={JSON.parse(mod?.systemConfigSchema as string)}
                uiSchema={{}}
                initialData={{}}
                hideSubmitButton
                onSubmit={onSystemConfigSubmit}
                ref={systemConfigFormRef}
              />
            </CollapseList.Item>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              color="background"
            />
            <Button
              fullWidth
              isLoading={isLoading}
              text="Install"
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
