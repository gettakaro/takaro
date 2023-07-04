import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Select, TextField, Drawer, CollapseList, ErrorMessage } from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTO,
  MockConnectionInfo,
  RustConnectionInfo,
  SdtdConnectionInfo,
} from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useParams } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useGameServer } from 'queries/gameservers';
import { useGameServerReachabilityByConfig, useGameServerUpdate } from 'queries/gameservers/queries';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { validationSchema } from './validationSchema';
import { gameTypeSelectOptions } from './GameTypeSelectOptions';

export interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: MockConnectionInfo | RustConnectionInfo | SdtdConnectionInfo;
}

export const UpdateGameServer = () => {
  const { serverId } = useParams();
  const { data, isLoading } = useGameServer(serverId!);

  if (isLoading) {
    return <>isLoading</>;
  }

  if (!data || !serverId) {
    return <>something went wrong</>;
  }

  return <UpdateGameServerForm data={data} serverId={serverId} />;
};

interface Props {
  data: GameServerOutputDTO;
  serverId: string;
}

const UpdateGameServerForm: FC<Props> = ({ data, serverId }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useGameServerUpdate();
  const { mutateAsync: testReachabilityMutation, isLoading: testingConnection } = useGameServerReachabilityByConfig();
  const [connectionOk, setConnectionOk] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServers.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit, watch } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      type: data.type,
      name: data.name,
      connectionInfo: data?.connectionInfo,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, connectionInfo }) => {
    try {
      setError('');
      mutateAsync({
        gameServerId: serverId!,
        gameServerDetails: {
          name,
          type: data.type,
          connectionInfo: JSON.stringify(connectionInfo),
        },
      });
      navigate(PATHS.gameServers.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const { type, connectionInfo, name } = watch();

  const clickTestReachability = async () => {
    setError('');
    const response = await testReachabilityMutation({
      type,
      connectionInfo: JSON.stringify(connectionInfo),
    });

    if (response.data.data.connectable) {
      setConnectionOk(true);
    } else {
      setError(response.data.data.reason || 'Connection error');
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Edit Game Server</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="update-game-server-form">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Server name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool server"
                  required
                />
                <Select
                  control={control}
                  name="type"
                  label="Game Server"
                  required
                  loading={isLoading}
                  readOnly
                  render={(selectedIndex) => <div>{gameTypeSelectOptions[selectedIndex]?.name ?? 'Select...'}</div>}
                >
                  <Select.OptionGroup label="Games">
                    {gameTypeSelectOptions.map(({ name, value }) => (
                      <Select.Option key={`select-${name}`} value={value}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select.OptionGroup>
                </Select>
              </CollapseList.Item>
              <CollapseList.Item title="Connection info">
                {connectionInfoFieldsMap(isLoading, control)[data.type]}
              </CollapseList.Item>
              {error && <ErrorMessage message={error} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" type="button" />
            <Button fullWidth isLoading={testingConnection} onClick={clickTestReachability} text="Test connection" />
            {connectionOk && (
              <Button
                fullWidth
                text="Save changes"
                onClick={() => {
                  onSubmit({
                    type,
                    connectionInfo,
                    name,
                  });
                }}
                form="create-game-server-form"
              />
            )}
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default UpdateGameServer;
