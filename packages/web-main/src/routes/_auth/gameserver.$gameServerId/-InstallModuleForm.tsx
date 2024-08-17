import { FC, useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Drawer, CollapseList, styled, FormError } from '@takaro/lib-components';
import { useGameServerModuleInstall } from 'queries/gameserver';
import Form from '@rjsf/core';
import { JsonSchemaForm } from 'components/JsonSchemaForm';
import { ModuleInstallationOutputDTO, ModuleOutputDTO } from '@takaro/apiclient';
import { useSnackbar } from 'notistack';

interface InstallModuleFormProps {
  gameServerId: string;
  mod: ModuleOutputDTO;
  modInstallation: ModuleInstallationOutputDTO;
  readOnly?: boolean;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const InstallModuleForm: FC<InstallModuleFormProps> = ({
  readOnly = false,
  mod,
  modInstallation,
  gameServerId,
}) => {
  const [open, setOpen] = useState<boolean>(true);
  const [userConfigSubmitted, setUserConfigSubmitted] = useState<boolean>(false);
  const [systemConfigSubmitted, setSystemConfigSubmitted] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutate, isPending, error, isSuccess } = useGameServerModuleInstall();
  const { enqueueSnackbar } = useSnackbar();

  const [userConfig, setUserConfig] = useState<Record<string, unknown>>({});
  const [systemConfig, setSystemConfig] = useState<Record<string, unknown>>({});

  const userConfigFormRef = useRef<Form>(null);
  const systemConfigFormRef = useRef<Form>(null);

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
      navigate({ to: '/gameserver/$gameServerId/modules', params: { gameServerId } });
    }
  }, [open, navigate, gameServerId]);

  const onSubmit = useCallback(async () => {
    mutate({
      gameServerId: gameServerId,
      moduleId: mod.id,
      moduleInstall: {
        systemConfig: JSON.stringify(systemConfig),
        userConfig: JSON.stringify(userConfig),
      },
    });
  }, [mod.id, navigate, gameServerId, systemConfig, userConfig]);

  useEffect(() => {
    if (isSuccess) {
      navigate({ to: '/gameserver/$gameServerId/modules', params: { gameServerId } });
      enqueueSnackbar('Module installed!', { variant: 'default', type: 'success' });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (userConfig && systemConfig && userConfigSubmitted && systemConfigSubmitted) {
      onSubmit();
      setUserConfigSubmitted(false);
      setSystemConfigSubmitted(false);
    }
  }, [userConfigSubmitted, systemConfigSubmitted, userConfig, systemConfig]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Install module</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="User config">
              <JsonSchemaForm
                readOnly={readOnly}
                schema={JSON.parse(mod?.configSchema as string)}
                uiSchema={JSON.parse(mod?.uiSchema as string)}
                initialData={modInstallation?.userConfig || userConfig}
                hideSubmitButton
                onSubmit={onUserConfigSubmit}
                ref={userConfigFormRef}
              />
            </CollapseList.Item>
            <CollapseList.Item title="System config">
              <JsonSchemaForm
                readOnly={readOnly}
                schema={JSON.parse(mod?.systemConfigSchema as string)}
                uiSchema={{}} /* System config does not have uiSchema*/
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
          {readOnly ? (
            <Button fullWidth text="Close view" onClick={() => setOpen(false)} color="primary" />
          ) : (
            <ButtonContainer>
              <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
              <Button
                fullWidth
                isLoading={isPending}
                text="Install module"
                type="button"
                onClick={() => {
                  systemConfigFormRef.current?.formElement.current.requestSubmit();
                  userConfigFormRef.current?.formElement.current.requestSubmit();
                }}
              />
            </ButtonContainer>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
