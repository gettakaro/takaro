import { FC, Fragment, useMemo, ReactElement } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField } from '@takaro/lib-components';
import { AiFillSave } from 'react-icons/ai';
import { Settings } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useParams } from 'react-router-dom';
import { useGameServerSettings } from 'queries/gameservers';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

interface IFormInputs {
  commandPrefix: string;
  serverChatName: string;
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

export const GlobalGameServerSettings: FC = () => {
  useDocumentTitle('Settings');
  const apiClient = useApiClient();
  const { serverId } = useParams();

  const { data, isLoading } = useGameServerSettings(serverId!);

  const validationSchema = useMemo(() => {
    const schema = {};
    if (data) {
      mapSettings(data, async (key) => (schema[key] = z.string().nonempty()));
    }
    return z.object(schema);
  }, [data]);

  const { control, handleSubmit, getValues, setValue } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async () => {
    const formValues = getValues();

    await mapSettings(formValues as Settings, async (key, value) =>
      apiClient.settings.settingsControllerSet(key, {
        value: value!,
        gameServerId: serverId,
      })
    );
  };

  const settings = useMemo(() => {
    const settingsComponents: ReactElement[] = [];
    if (data) {
      // TODO: this should be mapped using the new config generator
      mapSettings(data, async (key, value) => {
        if (value) setValue(key, value);

        settingsComponents.push(<TextField control={control} label={key} name={key} key={key} />);
      });
    }

    return settingsComponents;
  }, [data]);

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fragment>
          {settings}
          <Button icon={<AiFillSave />} isLoading={isLoading} text="Save" type="submit" variant="default" />
        </Fragment>
      </form>
    </Fragment>
  );
};
