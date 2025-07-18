import {
  useDeleteGameServerSetting,
  gameServerSettingsQueryOptions,
  globalGameServerSettingsQueryOptions,
  useSetGameServerSetting,
} from '../../../queries/setting';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Switch, TextField, Button, SelectField, styled, Skeleton, camelCaseToSpaces } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';
import { PERMISSIONS, SettingsOutputDTOTypeEnum } from '@takaro/apiclient';
import { hasPermission, useHasPermission } from '../../../hooks/useHasPermission';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { userMeQueryOptions } from '../../../queries/user';
import { booleanFields } from '../../../util/settings';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/settings')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ReadSettings])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [gameServerSettings, globalGameServerSettings] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingsQueryOptions(params.gameServerId)),
      context.queryClient.ensureQueryData(globalGameServerSettingsQueryOptions()),
    ]);
    return { gameServerSettings, globalGameServerSettings };
  },
  component: Component,
  pendingComponent: () => (
    <div>
      <h2>Game server Settings</h2>
      <SettingsContainer>
        <div>Setting</div>
        <div>Global setting</div>
        <div>Override</div>
        <div>Game Server setting</div>

        {/* Render 35 skeletons with random heights */}
        {[...Array(20)].map((_e, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height="75px" />
        ))}
      </SettingsContainer>
    </div>
  ),
});

const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 150px 1fr;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

const NoSpacing = styled.div`
  div {
    margin: 0;
  }
`;

// Should be a one-to-one mapping of the SettingsOutputDTO with the exception that values can be booleans
interface FormSetting {
  type: SettingsOutputDTOTypeEnum;
  key: string;
  value: string | boolean;
}

interface IFormInputs {
  settings: FormSetting[];
}

const typeOptions = [SettingsOutputDTOTypeEnum.Inherit, SettingsOutputDTOTypeEnum.Override];

function Component() {
  useDocumentTitle('Settings');
  const { mutate: deleteGameServerSetting } = useDeleteGameServerSetting();
  const { mutate: setGameServerSetting } = useSetGameServerSetting();
  const { gameServerId } = Route.useParams();

  const { enqueueSnackbar } = useSnackbar();
  const loaderData = Route.useLoaderData();
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const [{ data: gameServerSettings }, { data: globalGameServerSettings }] = useQueries({
    queries: [
      { ...gameServerSettingsQueryOptions(gameServerId), initialData: loaderData.gameServerSettings },
      { ...globalGameServerSettingsQueryOptions(), initialData: loaderData.globalGameServerSettings },
    ],
  });

  const hasPermission = useHasPermission([PERMISSIONS.ManageSettings]);
  const readOnly = !hasPermission;

  const { control, handleSubmit, watch, formState, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
  });
  const { fields } = useFieldArray({
    name: 'settings',
    control,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ settings }) => {
    setIsUpdatingSettings(true);
    if (!formState.dirtyFields.settings) {
      return;
    }

    // dirtyFields.settings contains an ARRAY of all settings, but the unchanged ones are empty slots
    const changedFields: FormSetting[] = formState.dirtyFields.settings.reduce<FormSetting[]>(
      (acc, dirtySetting, idx) => {
        if (dirtySetting) {
          acc.push(settings[idx]);
        }
        return acc;
      },
      [],
    );

    try {
      for (const setting of changedFields) {
        if (setting.type === 'inherit') {
          deleteGameServerSetting({ key: setting.key, gameServerId: gameServerId });
        } else {
          // if the value is a boolean, we need to convert it to a string
          if (typeof setting.value === 'boolean') {
            setting.value = setting.value ? 'true' : 'false';
          }
          setGameServerSetting({
            gameServerId: gameServerId,
            key: setting.key,
            value: setting.value,
          });
        }
      }
      enqueueSnackbar('Settings updated!', { variant: 'default', type: 'success' });
    } catch {
      enqueueSnackbar('An error occurred while saving settings', { variant: 'default', type: 'error' });
      return;
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  useEffect(() => {
    if (isUpdatingSettings || !gameServerSettings || !globalGameServerSettings) return;

    reset({
      settings: gameServerSettings
        .filter(({ canHaveGameServerOverride }) => canHaveGameServerOverride)
        .map(({ key, value, type }) => {
          return {
            key,
            type:
              // There is also a default type, which we map to inherit
              type === SettingsOutputDTOTypeEnum.Override
                ? SettingsOutputDTOTypeEnum.Override
                : SettingsOutputDTOTypeEnum.Inherit,
            value: booleanFields.includes(key) ? value === 'true' : value,
          };
        }),
    });
  }, [gameServerSettings, globalGameServerSettings, reset]);

  const settingsComponents: Record<string, (fieldName: string, disabled: boolean) => ReactElement> = useMemo(() => {
    const components: Record<string, (fieldName: string, disabled: boolean) => ReactElement> = {};

    if (gameServerSettings) {
      gameServerSettings
        .filter(({ canHaveGameServerOverride }) => canHaveGameServerOverride)
        .forEach(({ key }) => {
          if (booleanFields.includes(key)) {
            components[key] = (fieldName: string, disabled: boolean) => (
              <NoSpacing>
                <Switch readOnly={readOnly} control={control} name={fieldName} key={key} disabled={disabled} />
              </NoSpacing>
            );
          } else {
            components[key] = (fieldName: string, disabled: boolean) => (
              <NoSpacing>
                <TextField readOnly={readOnly} control={control} name={fieldName} key={key} disabled={disabled} />
              </NoSpacing>
            );
          }
        });
    }

    return components;
  }, [gameServerSettings]);

  return (
    <>
      <h2>Game server Settings</h2>
      <p style={{ marginBottom: '15px' }}>
        Game servers use global settings by default, ensuring consistency across servers. However, individual game
        servers can override these global settings with their own custom configurations
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <>
          <SettingsContainer>
            <div>Setting</div>
            <div>Global setting</div>
            <div>Override</div>
            <div>Game Server setting</div>
          </SettingsContainer>

          {fields.map((field, index) => {
            const settingKey = watch(`settings.${index}.key`);
            const settingInfo = gameServerSettings.find((s) => s.key === settingKey);
            return (
              <SettingsContainer key={field.id}>
                <div>
                  <label
                    style={{
                      cursor:
                        watch(`settings.${index}.type`) === SettingsOutputDTOTypeEnum.Override ? 'pointer' : 'default',
                    }}
                    htmlFor={`settings.${index}.value`}
                  >
                    {camelCaseToSpaces(settingKey)}
                  </label>
                  {settingInfo && <div style={{ marginTop: '0.25rem' }}>{settingInfo.description}</div>}
                </div>
                <div>{globalGameServerSettings.find((setting) => setting.key === settingKey)?.value}</div>
                <NoSpacing>
                  <SelectField
                    readOnly={readOnly}
                    control={control}
                    name={`settings.${index}.type`}
                    render={(selectedItems) =>
                      selectedItems.length === 0 ? <div>Select...</div> : <div>{selectedItems[0].label}</div>
                    }
                  >
                    <SelectField.OptionGroup>
                      {typeOptions.map((val) => (
                        <SelectField.Option key={`select-${val}-option`} value={val} label={val}>
                          <span>{val}</span>
                        </SelectField.Option>
                      ))}
                    </SelectField.OptionGroup>
                  </SelectField>
                </NoSpacing>
                {watch(`settings.${index}.type`) === SettingsOutputDTOTypeEnum.Inherit ? (
                  <div id={`settings.${index}.value`}>
                    {globalGameServerSettings.find((setting) => setting.key === settingKey)?.value}
                  </div>
                ) : (
                  settingsComponents[settingKey](`settings.${index}.value`, false)
                )}
              </SettingsContainer>
            );
          })}
          {!readOnly && (
            <Button disabled={!formState.isDirty} type="submit" variant="default">
              Save settings
            </Button>
          )}
        </>
      </form>
    </>
  );
}
