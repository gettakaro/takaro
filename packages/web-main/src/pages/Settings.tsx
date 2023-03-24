import { FC, Fragment, useMemo, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, useValidationSchema } from '@takaro/lib-components';
import * as yup from 'yup';
import { AiFillSave } from 'react-icons/ai';
import { Settings, SettingsOutputObjectDTOAPI } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { QueryKeys } from 'queryKeys';

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

const SettingsPage: FC = () => {
  const apiClient = useApiClient();
  const { serverId } = useParams();

  const { data, isLoading } = useQuery<SettingsOutputObjectDTOAPI['data']>({
    queryKey: QueryKeys.settings,
    queryFn: async () => {
      const data = (
        await apiClient.settings.settingsControllerGet(undefined, serverId)
      ).data.data;
      await mapSettings(data, async (key, value) => {
        if (key === 'id' || key === 'createdAt' || key === 'updatedAt') return;
        setValue(key, value!!);
      });
      return data;
    },
  });

  const validationSchema = useMemo(() => {
    const schema = {};
    if (data) {
      mapSettings(data, async (key) => (schema[key] = yup.string().required()));
    }
    return yup.object(schema);
  }, [data]);

  const { control, handleSubmit, setValue, getValues } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema),
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
    mapSettings(data, async (key) =>
      settingsComponents.push(
        <TextField
          control={control}
          label={key}
          name={key}
          placeholder=""
          key={key}
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

export default SettingsPage;
