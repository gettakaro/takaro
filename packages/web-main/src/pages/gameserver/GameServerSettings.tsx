import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { booleanFields, camelCaseToSpaces, mapSettings } from 'pages/settings/GlobalGameServerSettings';
import { useDeleteGameServerSetting, useGameServerSettings, useGlobalGameServerSettings } from 'queries/settings';
import { FC, ReactElement, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Switch, TextField, Button, Select, styled, Skeleton } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';
import { useApiClient } from 'hooks/useApiClient';

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

interface FormSetting {
  behavior: string;
  key: string;
  value: string | boolean;
}

interface IFormInputs {
  settings: FormSetting[];
}

const behaviorOptions = ['override', 'inherit'];

const GameServerSettings: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameServerSettingsData, isLoading: isLoadingGameServerSettings } =
    useGameServerSettings(selectedGameServerId);
  const { data: globalGameServerSettingsData, isLoading: isLoadingGlobalServerGameServerSettings } =
    useGlobalGameServerSettings();

  const { mutateAsync: deleteGameServerSetting } = useDeleteGameServerSetting();
  const { enqueueSnackbar } = useSnackbar();
  const apiClient = useApiClient();

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
    const changedFields: FormSetting[] = formState.dirtyFields.settings.reduce((result, dirtySetting, idx) => {
      if (dirtySetting) {
        result.push(settings[idx]);
      }
      return result;
    }, [] as FormSetting[]);

    try {
      const updates = changedFields.map((setting) => {
        if (setting.behavior === 'inherit') {
          return deleteGameServerSetting({ key: setting.key, gameServerId: selectedGameServerId });
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

  const globalGameServerSettings = useMemo(() => {
    const settingsKeyValues: Record<string, string> = {};
    if (globalGameServerSettingsData) {
      mapSettings(globalGameServerSettingsData, async (key, value) => {
        settingsKeyValues[key] = value!;
      });
    }
    return settingsKeyValues;
  }, [globalGameServerSettingsData]);

  const gameServerSettings = useMemo(() => {
    const settingsComponents: Record<string, (fieldName: string, disabled: boolean) => ReactElement> = {};
    if (gameServerSettingsData && globalGameServerSettings) {
      mapSettings(gameServerSettingsData, async (key, value) => {
        if (booleanFields.includes(key)) {
          // in case the value is not set, we want to use the global value
          // otherwise we want to use the value from the gameserver
          if (fields.length !== Object.keys(gameServerSettingsData).length) {
            value === null
              ? append({ key, behavior: 'inherit', value: globalGameServerSettings[key] === 'true' ? true : false })
              : append({ key, behavior: 'override', value: value === 'true' ? true : false });
          }

          settingsComponents[key] = (fieldName: string, disabled: boolean) => (
            <NoSpacing>
              <Switch control={control} name={fieldName} key={key} disabled={disabled} />
            </NoSpacing>
          );
        } else {
          if (fields.length !== Object.keys(gameServerSettingsData).length) {
            value === null
              ? append({ key, behavior: 'inherit', value: globalGameServerSettings[key] })
              : append({ key, behavior: 'override', value: value! });
          }
          settingsComponents[key] = (fieldName: string, disabled: boolean) => (
            <NoSpacing>
              <TextField control={control} name={fieldName} key={key} disabled={disabled} />
            </NoSpacing>
          );
        }

        // By default append is considered as dirty, since we rely on the dirty state to define the required requests, we need to reset it.
        reset({}, { keepValues: true });
      });
    }
    return settingsComponents;
  }, [gameServerSettingsData, globalGameServerSettings]);

  if (
    isLoadingGlobalServerGameServerSettings ||
    isLoadingGameServerSettings ||
    Object.keys(gameServerSettings).length === 0
  ) {
    return (
      <div>
        <SettingsContainer>
          <div>Setting</div>
          <div>Global setting</div>
          <div>Override</div>
          <div>Game Server setting</div>

          {/* Render 35 skeletons with random heights */}
          {[...Array(20)].map((e, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height="75px" />
          ))}
        </SettingsContainer>
      </div>
    );
  }

  return (
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
            <div>{camelCaseToSpaces(watch(`settings.${index}.key`))}</div>
            <div>{globalGameServerSettings[watch(`settings.${index}.key`)]}</div>
            <NoSpacing>
              <Select
                control={control}
                name={`settings.${index}.behavior`}
                render={(selectedIndex) => <div>{behaviorOptions[selectedIndex] ?? 'Select...'}</div>}
              >
                <Select.OptionGroup>
                  {behaviorOptions.map((val) => (
                    <Select.Option key={`select-${val}-option`} value={val}>
                      <span>{val}</span>
                    </Select.Option>
                  ))}
                </Select.OptionGroup>
              </Select>
            </NoSpacing>
            {watch(`settings.${index}.behavior`) === 'inherit' ? (
              <div>{globalGameServerSettings[watch(`settings.${index}.key`)]}</div>
            ) : (
              gameServerSettings[watch(`settings.${index}.key`)](
                `settings.${index}.value`,
                watch(`settings.${index}.behavior`) === 'inherit'
              )
            )}
          </SettingsContainer>
        ))}
        <Button
          disabled={!formState.isDirty}
          isLoading={isLoadingGameServerSettings}
          text="Save"
          type="submit"
          variant="default"
        />
      </>
    </form>
  );
};
export default GameServerSettings;
