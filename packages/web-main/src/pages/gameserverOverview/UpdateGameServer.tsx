import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  SelectField,
  TextField,
  Drawer,
  CollapseList,
  FormError,
  DrawerSkeleton,
} from '@takaro/lib-components';
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
  const { serverId } = useParams() as { serverId: string };
  const { data, isLoading } = useGameServer(serverId);

  if (isLoading) {
    return <DrawerSkeleton />;
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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutateAsync, isPending, error: gameServerUpdateError } = useGameServerUpdate();
  const { mutateAsync: testReachabilityMutation, isPending: testingConnection } = useGameServerReachabilityByConfig();
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
    await mutateAsync({
      gameServerId: serverId,
      gameServerDetails: {
        name,
        type: data.type,
        connectionInfo: JSON.stringify(connectionInfo),
      },
    });
    navigate(PATHS.gameServers.overview());
  };

  const { type, connectionInfo, name } = watch();

  const clickTestReachability = async () => {
    const response = await testReachabilityMutation({
      type,
      connectionInfo: JSON.stringify(connectionInfo),
    });

    if (response.connectable) {
      setConnectionOk(true);
      setError(null);
    } else {
      setError(response.reason || 'Connection error');
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
                  loading={isPending}
                  name="name"
                  placeholder="My cool server"
                  required
                />
                <SelectField
                  control={control}
                  name="type"
                  label="Game Server"
                  required
                  loading={isPending}
                  readOnly
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return <div>Select...</div>;
                    }
                    return <div>{selectedItems[0].label}</div>;
                  }}
                >
                  <SelectField.OptionGroup label="Games">
                    {gameTypeSelectOptions.map(({ name, value }) => (
                      <SelectField.Option key={`select-${name}`} value={value} label={name}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </SelectField.Option>
                    ))}
                  </SelectField.OptionGroup>
                </SelectField>
              </CollapseList.Item>
              <CollapseList.Item title="Connection info">
                {connectionInfoFieldsMap(isPending, control)[data.type]}
              </CollapseList.Item>
            </form>
          </CollapseList>
          {error && <FormError error={error} />}
          {gameServerUpdateError && <FormError error={gameServerUpdateError} />}
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
