import { Fragment, useMemo, ReactElement } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Switch, TextField, camelCaseToSpaces } from '@takaro/lib-components';
import { Settings, PERMISSIONS } from '@takaro/apiclient';
import { useSetGlobalSetting, globalGameServerSettingsQueryOptions } from '../../../../queries/setting';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle';
import { useSnackbar } from 'notistack';
import { hasPermission, useHasPermission } from '../../../../hooks/useHasPermission';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { userMeQueryOptions } from '../../../../queries/user';
import { useQuery } from '@tanstack/react-query';
import { booleanFields } from '../../../../util/settings';

export const Route = createFileRoute('/_auth/_global/settings/gameservers')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_SETTINGS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(globalGameServerSettingsQueryOptions()),
  component: Component,
  pendingComponent: PendingComponent,
});

function dirtyValues(dirtyFields: object | boolean, allValues: object): object {
  // If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
  // "placeholders" for unchanged elements. `dirtyFields` is `true` for leaves.
  if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
  // Here, we have an object
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [key, dirtyValues(dirtyFields[key], allValues[key])]),
  );
}

interface IFormInputs {
  commandPrefix: string;
  serverChatName: string;
  economyEnabled: boolean;
  currencyName: string;
  developerMode: boolean;
}

function mapSettings<T extends Promise<unknown>>(data: Settings, fn: (key: keyof IFormInputs, value?: string) => T) {
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

function PendingComponent() {
  return <div>Loading...</div>;
}

function Component() {
  useDocumentTitle('Settings');
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: setGlobalSetting, isPending } = useSetGlobalSetting();
  const hasPermission = useHasPermission([PERMISSIONS.ManageSettings]);
  const readOnly = !hasPermission;
  const { data } = useQuery({ ...globalGameServerSettingsQueryOptions(), initialData: Route.useLoaderData() });

  const validationSchema = useMemo(() => {
    if (data) {
      const res = data.reduce((acc, { key }) => {
        if (booleanFields.includes(key)) {
          acc[key] = z.boolean();
        } else {
          acc[key] = z.string();
        }
        return acc;
      }, {});
      return z.object(res);
    }

    return z.object({});
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
    } catch {
      enqueueSnackbar('An error occurred while saving settings', { variant: 'default', type: 'error' });
      return;
    }
  };

  const settings = useMemo(() => {
    const settingsComponents: ReactElement[] = [];
    if (data) {
      // TODO: this should be mapped using the new config generator
      data.forEach(({ key, value }) => {
        if (booleanFields.includes(key)) {
          settingsComponents.push(
            <Switch readOnly={readOnly} control={control} label={camelCaseToSpaces(key)} name={key} key={key} />,
          );
          setValue(key, value === 'true');
        } else {
          settingsComponents.push(
            <TextField readOnly={readOnly} control={control} label={camelCaseToSpaces(key)} name={key} key={key} />,
          );
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
          {!readOnly && (
            <Button disabled={!formState.isDirty} isLoading={isPending} type="submit" variant="default">
              Save settings
            </Button>
          )}
        </Fragment>
      </form>
    </Fragment>
  );
}
