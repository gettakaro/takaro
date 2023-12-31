import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { booleanFields, camelCaseToSpaces, mapSettings } from 'pages/settings/GlobalGameServerSettings';
import { gameServerKeys, useGameServerSettings } from 'queries/gameservers';
import { FC, ReactElement, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Switch, TextField, Button, Select, styled } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
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

const options = ['override', 'inherit'];

const GameServerSettings: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { data: gameServerSettingsData, isLoading } = useGameServerSettings(selectedGameServerId);
  const { data: globalGameServerSettingsData } = useGameServerSettings();
  const { enqueueSnackbar } = useSnackbar();
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const { control, handleSubmit, watch, formState, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
  });
  const { fields, append } = useFieldArray({
    name: 'settings',
    control,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ settings }) => {
    console.log(formState.dirtyFields);
    console.log(Object.keys(formState.dirtyFields));

    if (!formState.dirtyFields.settings) {
      // TODO: reset
      return;
    }

    // dirtyFields.settings contains an array of all settings, but the unchanged ones are empty slots
    const dirty = formState.dirtyFields.settings
      .map((dirtySetting, idx) => {
        if (!dirtySetting) {
          return null;
        }
        return settings[idx];
      })
      .filter((setting) => setting !== null);

    try {
      const updates = dirty.map((setting) => {
        // to reset the gameserver specific setting, we need to set the value to null
        if (setting!.behavior === 'inherit') {
          return apiClient.settings.settingsControllerSet(setting!.key, {
            gameServerId: selectedGameServerId,
            value: '',
          });
        }

        apiClient.settings.settingsControllerSet(setting!.key, {
          value: setting!.value,
          gameServerId: selectedGameServerId,
        });
      });
      await Promise.all(updates);

      // Reset settings from this gameserver
      queryClient.invalidateQueries(gameServerKeys.detail(selectedGameServerId));

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
    if (gameServerSettingsData && globalGameServerSettings && fields.length === 0) {
      mapSettings(gameServerSettingsData, async (key, value) => {
        if (booleanFields.includes(key)) {
          // in case the value is not set, we want to use the global value
          // otherwise we want to use the value from the gameserver
          value === null
            ? append({ key, behavior: 'inherit', value: globalGameServerSettings[key] === 'true' ? true : false })
            : append({ key, behavior: 'override', value: value === 'true' ? true : false });
          settingsComponents[key] = (fieldName: string, disabled: boolean) => (
            <NoSpacing>
              <Switch control={control} name={fieldName} key={key} disabled={disabled} />
            </NoSpacing>
          );
        } else {
          value === null
            ? append({ key, behavior: 'inherit', value: globalGameServerSettings[key] })
            : append({ key, behavior: 'override', value: value! });
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

  console.log(gameServerSettings);

  if (Object.keys(gameServerSettings).length === 0) {
    return <div>loading...</div>;
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
            {/*<div ><TextField control={control} name={`settings.${index}.name`} readOnly /></div>*/}
            <div>{globalGameServerSettings[watch(`settings.${index}.key`)]}</div>
            <NoSpacing>
              <Select
                control={control}
                name={`settings.${index}.behavior`}
                render={(selectedIndex) => <div>{options[selectedIndex] ?? 'Select...'}</div>}
              >
                <Select.OptionGroup>
                  {options.map((val) => (
                    <Select.Option key={`select-${val}-option`} value={val}>
                      <span>{val}</span>
                    </Select.Option>
                  ))}
                </Select.OptionGroup>
              </Select>
            </NoSpacing>
            {gameServerSettings[watch(`settings.${index}.key`)](
              `settings.${index}.value`,
              watch(`settings.${index}.behavior`) === 'inherit'
            )}
          </SettingsContainer>
        ))}
        <Button disabled={!formState.isDirty} isLoading={isLoading} text="Save" type="submit" variant="default" />
      </>
    </form>
  );
};
export default GameServerSettings;
