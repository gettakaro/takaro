import { FC, Fragment, useMemo, ReactElement } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Switch, TextField, camelCaseToSpaces } from '@takaro/lib-components';
import { Settings } from '@takaro/apiclient';
import { useGlobalGameServerSettings, useSetGlobalSetting } from 'queries/settings';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useSnackbar } from 'notistack';

export function dirtyValues(dirtyFields: object | boolean, allValues: object): object {
  // If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
  // "placeholders" for unchanged elements. `dirtyFields` is `true` for leaves.
  if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
  // Here, we have an object
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [key, dirtyValues(dirtyFields[key], allValues[key])])
  );
}

interface IFormInputs {
  commandPrefix: string;
  serverChatName: string;
  economyEnabled: boolean;
  currencyName: string;
}

export const booleanFields = ['economyEnabled'];

export function mapSettings<T extends Promise<unknown>>(
  data: Settings,
  fn: (key: keyof IFormInputs, value?: string) => T
) {
  const promises: Promise<unknown>[] = [];
  for (const key in data) {
    const settingsKey = key as keyof IFormInputs;
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      promises.push(fn(settingsKey, element));
    }
  }
  return Promise.all(promises);
}

export const GlobalGameServerSettings: FC = () => {
  useDocumentTitle('Settings');
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: setGlobalSetting } = useSetGlobalSetting();

  const { data, isLoading } = useGlobalGameServerSettings();

  const validationSchema = useMemo(() => {
    const schema = {};
    if (data) {
      mapSettings(data, async (key) => {
        if (booleanFields.includes(key)) {
          schema[key] = z.boolean();
        } else {
          schema[key] = z.string();
        }
      });
    }
    return z.object(schema);
  }, [data]);

  const { control, handleSubmit, setValue, formState, reset } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (values) => {
    const changedFields = dirtyValues(formState.dirtyFields, values) as Settings;

    try {
      await mapSettings(changedFields, async (key, value) => {
        if (typeof value === 'boolean') {
          return await setGlobalSetting({ key, value: value ? 'true' : 'false' });
        }
        return await setGlobalSetting({ key, value: value as string });
      });

      enqueueSnackbar('Settings has been successfully saved', { variant: 'default' });
      reset({}, { keepValues: true });
    } catch (error) {
      enqueueSnackbar('An error occurred while saving settings', { variant: 'default', type: 'error' });
      return;
    }
  };

  const settings = useMemo(() => {
    const settingsComponents: ReactElement[] = [];
    if (data) {
      // TODO: this should be mapped using the new config generator
      mapSettings(data, async (key, value) => {
        if (booleanFields.includes(key)) {
          settingsComponents.push(<Switch control={control} label={camelCaseToSpaces(key)} name={key} key={key} />);
          setValue(key, value === 'true');
        } else {
          settingsComponents.push(<TextField control={control} label={camelCaseToSpaces(key)} name={key} key={key} />);
          if (value) setValue(key, value);
        }
      });
    }

    return settingsComponents;
  }, [data]);

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fragment>
          {settings}
          <Button
            disabled={!formState.isDirty}
            isLoading={isLoading}
            text="Save settings"
            type="submit"
            variant="default"
          />
        </Fragment>
      </form>
    </Fragment>
  );
};
