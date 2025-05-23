import { FC, useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Drawer, CollapseList, styled, FormError, Chip } from '@takaro/lib-components';
import { useGameServerModuleInstall } from '../../../queries/gameserver';
import Form from '@rjsf/core';
import { JsonSchemaForm } from '../../../components/JsonSchemaForm';
import { ModuleInstallationOutputDTO, ModuleOutputDTO, ModuleVersionOutputDTO } from '@takaro/apiclient';

interface InstallModuleFormProps {
  gameServerId: string;
  mod: ModuleOutputDTO;
  modInstallation?: ModuleInstallationOutputDTO;
  modVersion: ModuleVersionOutputDTO;
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
  modVersion,
  gameServerId,
  modInstallation,
}) => {
  const [open, setOpen] = useState<boolean>(true);
  const [userConfigSubmitted, setUserConfigSubmitted] = useState<boolean>(false);
  const [systemConfigSubmitted, setSystemConfigSubmitted] = useState<boolean>(false);
  const [isDirty, setisDirty] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutate, isPending, error, isSuccess } = useGameServerModuleInstall();

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
      versionId: modVersion.id,
      userConfig: JSON.stringify(userConfig),
      systemConfig: JSON.stringify(systemConfig),
    });
  }, [mod.id, navigate, gameServerId, systemConfig, userConfig]);

  useEffect(() => {
    if (isSuccess) {
      navigate({ to: '/gameserver/$gameServerId/modules', params: { gameServerId } });
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
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={readOnly === false && isDirty}>
      <Drawer.Content>
        <Drawer.Heading>
          <span style={{ marginRight: '10px' }}>{readOnly ? 'View configuration' : 'Install module'}</span>
          <Chip variant="outline" color="primary" label={modVersion.tag} />
        </Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="User config">
              <JsonSchemaForm
                readOnly={readOnly}
                schema={JSON.parse(modVersion.configSchema as string)}
                uiSchema={JSON.parse(modVersion.uiSchema as string)}
                initialData={modInstallation?.userConfig || userConfig}
                hideSubmitButton
                onSubmit={onUserConfigSubmit}
                ref={userConfigFormRef}
                onChange={() => {
                  setisDirty(true);
                }}
              />
            </CollapseList.Item>
            <CollapseList.Item title="System config">
              <JsonSchemaForm
                readOnly={readOnly}
                schema={JSON.parse(modVersion.systemConfigSchema as string)}
                uiSchema={{}} /* System config does not have uiSchema*/
                initialData={modInstallation?.systemConfig || modVersion.defaultSystemConfig || systemConfig}
                hideSubmitButton
                onSubmit={onSystemConfigSubmit}
                onChange={() => {
                  setisDirty(true);
                }}
                ref={systemConfigFormRef}
              />
            </CollapseList.Item>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          {error && <FormError error={error} />}
          {readOnly ? (
            <Button fullWidth onClick={() => setOpen(false)} color="primary">
              Close view
            </Button>
          ) : (
            <ButtonContainer>
              <Button onClick={() => setOpen(false)} color="background">
                Cancel
              </Button>
              <Button
                fullWidth
                isLoading={isPending}
                type="button"
                onClick={() => {
                  systemConfigFormRef.current?.formElement.current.requestSubmit();
                  userConfigFormRef.current?.formElement.current.requestSubmit();
                }}
              >
                Install module
              </Button>
            </ButtonContainer>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
