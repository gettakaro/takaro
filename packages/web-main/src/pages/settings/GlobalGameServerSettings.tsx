import { FC, Fragment, useMemo, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField } from '@takaro/lib-components';
import * as yup from 'yup';
import { AiFillSave } from 'react-icons/ai';
import { Settings } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useParams } from 'react-router-dom';
import { useGameServerSettings } from 'queries/gameservers';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface IFormInputs {
  commandPrefix: string;
  serverChatName: string;
}

function mapSettings<T extends Promise<unknown>>(
  data: Settings,
  fn: (key: keyof Settings, value?: string) => T
) {
  const promises: Promise<unknown>[] = [];
  for (const key in data) {
    const settingsKey = key as keyof Settings;
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      promises.push(fn(settingsKey, element));
    }
  }
  return Promise.all(promises);
}

export const GlobalGameServerSettings: FC = () => {
  const apiClient = useApiClient();
  const { serverId } = useParams();

  const { data, isLoading } = useGameServerSettings(serverId!);

  const validationSchema = useMemo(() => {
    const schema = {};
    if (data) {
      mapSettings(
        data.data,
        async (key) => (schema[key] = z.string().nonempty())
      );
    }
    return z.object(schema);
  }, [data]);

  const { control, handleSubmit, getValues } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async () => {
    const formValues = getValues();

    await mapSettings(formValues as Settings, async (key, value) =>
      apiClient.settings.settingsControllerSet(key, {
        value: value!!,
        gameServerId: serverId,
      })
    );
  };

  const settingsComponents: ReactElement[] = [];

  if (data) {
    mapSettings(data.data, async (key, value) =>
      settingsComponents.push(
        <TextField
          control={control}
          label={key}
          name={key}
          key={key}
          value={value}
        />
      )
    );
  }

  return (
    <Fragment>
      <Helmet>
        <title>Settings - Takaro</title>
      </Helmet>
      <form onSubmit={handleSubmit(onSubmit)}>
        {settingsComponents}
        <Button
          icon={<AiFillSave />}
          isLoading={isLoading}
          text="Save"
          type="submit"
          variant="default"
        />
      </form>
    </Fragment>
  );
};
