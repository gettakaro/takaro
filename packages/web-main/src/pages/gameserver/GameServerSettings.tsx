/*
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { booleanFields, camelCaseToSpaces, GlobalGameServerSettings, mapSettings } from 'pages/settings/GlobalGameServerSettings';
import { useGameServerSettings } from 'queries/gameservers';
import { FC, Fragment, ReactElement, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Switch, TextField } from '@takaro/lib-components';
*/

import { FC } from 'react';
import { GlobalGameServerSettings } from 'pages/settings/GlobalGameServerSettings';

const GameServerSettings: FC = () => {
  return <GlobalGameServerSettings />;
};

export default GameServerSettings;

/*
const GameServerSettings: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { data } = useGameServerSettings(selectedGameServerId);

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


  const settings = useMemo(() => {
    const settingsComponents: ReactElement[] = [];
    if (data) {
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
          <Button disabled={!formState.isDirty} icon={<AiFillSave />} isLoading={isLoading} text="Save" type="submit" variant="default" />
        </Fragment>
      </form>
    </Fragment>
  );
};
export default GameServerSettings;

*/
