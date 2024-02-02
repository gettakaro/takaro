import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { booleanFields } from 'pages/settings/GlobalGameServerSettings';
import { useDeleteGameServerSetting, useGameServerSettings, useGlobalGameServerSettings } from 'queries/settings';
import { FC, ReactElement, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Switch, TextField, Button, SelectField, styled, Skeleton, camelCaseToSpaces } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';
import { useApiClient } from 'hooks/useApiClient';
import { PERMISSIONS, SettingsOutputDTOTypeEnum } from '@takaro/apiclient';
import { useHasPermission } from 'components/PermissionsGuard';

const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 130px 150px 150px 1fr;
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

const GameServerSettings: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameServerSettings, isLoading: isLoadingGameServerSettings } =
    useGameServerSettings(selectedGameServerId);
  const { data: globalGameServerSettings, isLoading: isLoadingGlobalServerGameServerSettings } =
    useGlobalGameServerSettings();
  const { hasPermission, isLoading: isLoadingPermissions } = useHasPermission([PERMISSIONS.ManageSettings]);
  const { mutateAsync: deleteGameServerSetting } = useDeleteGameServerSetting();
  const { enqueueSnackbar } = useSnackbar();
  const apiClient = useApiClient();

  const readOnly = !hasPermission;

  const { control, handleSubmit, watch, formState, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
  });
  const { fields, append } = useFieldArray({
    name: 'settings',
    control,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ settings }) => {
    if (!formState.dirtyFields.settings) {
      // TODO: reset
      return;
    }

    // dirtyFields.settings contains an ARRAY of all settings, but the unchanged ones are empty slots
    const changedFields: FormSetting[] = formState.dirtyFields.settings.reduce((acc, dirtySetting, idx) => {
      if (dirtySetting) {
        acc.push(settings[idx]);
      }
      return acc;
    }, [] as FormSetting[]);

    try {
      const updates = changedFields.map((setting) => {
        if (setting.type === 'inherit') {
          return deleteGameServerSetting({ key: setting.key, gameServerId: selectedGameServerId });
        }

        // if the value is a boolean, we need to convert it to a string
        if (typeof setting.value === 'boolean') {
          setting.value = setting.value ? 'true' : 'false';
        }

        apiClient.settings.settingsControllerSet(setting.key, {
          value: setting.value,
          gameServerId: selectedGameServerId,
        });
      });
      await Promise.all(updates);

      enqueueSnackbar('Settings has been successfully saved', { variant: 'default' });
      reset({}, { keepValues: true });
    } catch (error) {
      enqueueSnackbar('An error occurred while saving settings', { variant: 'default', type: 'error' });
      return;
    }
  };

  const gameServerSettingComponents = useMemo(() => {
    const settingsComponents: Record<string, (fieldName: string, disabled: boolean) => ReactElement> = {};
    // in case the value is not set, we want to use the global value
    // otherwise we want to use the value from the gameserver
    if (gameServerSettings && globalGameServerSettings) {
      gameServerSettings.forEach(({ key, value, type }) => {
        if (booleanFields.includes(key)) {
          // to make sure we only append the fields once
          // All fields are strings, however, the Switch component requires a boolean value.
          if (fields.length !== Object.keys(gameServerSettings).length) {
            type === SettingsOutputDTOTypeEnum.Override
              ? append({ key, type: SettingsOutputDTOTypeEnum.Override, value: value === 'true' ? true : false })
              : append({ key, type: SettingsOutputDTOTypeEnum.Inherit, value: value === 'true' ? true : false });
          }
          settingsComponents[key] = (fieldName: string, disabled: boolean) => (
            <NoSpacing>
              <Switch readOnly={readOnly} control={control} name={fieldName} key={key} disabled={disabled} />
            </NoSpacing>
          );
        } else {
          if (fields.length !== Object.keys(gameServerSettings).length) {
            type === SettingsOutputDTOTypeEnum.Override // other cases are `inherit` or `default` but we both consider them as `inherit`
              ? append({ key, type: SettingsOutputDTOTypeEnum.Override, value: value })
              : append({ key, type: SettingsOutputDTOTypeEnum.Inherit, value: value });
          }
          settingsComponents[key] = (fieldName: string, disabled: boolean) => (
            <NoSpacing>
              <TextField readOnly={readOnly} control={control} name={fieldName} key={key} disabled={disabled} />
            </NoSpacing>
          );
        }
        // By default `append` is considered as dirty, since we rely on the dirty state to define the required requests, we need to reset it.
        reset({}, { keepValues: true });
      });
    }
    return settingsComponents;
  }, [gameServerSettings, globalGameServerSettings]);

  if (isLoadingGlobalServerGameServerSettings || isLoadingGameServerSettings || isLoadingPermissions) {
    return (
      <div>
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
    );
  }

  // if we can't find the settings, something went wrong
  if (!gameServerSettings || !globalGameServerSettings) {
    return <div>Something went wrong</div>;
  }

  return (
    <>
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

          {fields.map((field, index) => (
            <SettingsContainer key={field.id}>
              <label
                style={{
                  cursor:
                    watch(`settings.${index}.type`) === SettingsOutputDTOTypeEnum.Override ? 'pointer' : 'default',
                }}
                htmlFor={`settings.${index}.value`}
              >
                {camelCaseToSpaces(watch(`settings.${index}.key`))}
              </label>
              <div>
                {globalGameServerSettings.find((setting) => setting.key === watch(`settings.${index}.key`))?.value}
              </div>
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
                  {globalGameServerSettings.find((setting) => setting.key === watch(`settings.${index}.key`))?.value}
                </div>
              ) : (
                gameServerSettingComponents[watch(`settings.${index}.key`)](`settings.${index}.value`, false)
              )}
            </SettingsContainer>
          ))}
          {!readOnly && (
            <Button
              disabled={!formState.isDirty}
              isLoading={isLoadingGameServerSettings}
              text="Save"
              type="submit"
              variant="default"
            />
          )}
        </>
      </form>
    </>
  );
};
export default GameServerSettings;
