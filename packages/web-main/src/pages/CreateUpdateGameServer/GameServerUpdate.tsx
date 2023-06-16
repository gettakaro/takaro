import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Select,
  OptionGroup,
  Option,
  TextField,
  DrawerContent,
  DrawerHeading,
  Drawer,
  DrawerFooter,
  DrawerBody,
  CollapseList,
  ErrorMessage,
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
import * as Sentry from '@sentry/react';
import { useGameServer } from 'queries/gameservers';
import {
  useGameServerReachabilityByConfig,
  useGameServerUpdate,
} from 'queries/gameservers/queries';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { validationSchema } from './validationSchema';

export interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: MockConnectionInfo | RustConnectionInfo | SdtdConnectionInfo;
}

const gameTypeSelectOptions = [
  {
    name: 'Mock (testing purposes)',
    value: GameServerCreateDTOTypeEnum.Mock,
    show: import.meta.env.DEV,
  },
  {
    name: 'Rust',
    value: GameServerCreateDTOTypeEnum.Rust,
    show: true,
  },
  {
    name: '7 Days to die',
    value: GameServerCreateDTOTypeEnum.Sevendaystodie,
    show: true,
  },
].filter(({ show }) => show);

export const CreateUpdateGameServer = () => {
  const { serverId } = useParams();
  const { data, isLoading } = useGameServer(serverId!);
  const [connectionOk, setConnectionOk] = useState<boolean>(false);

  if (isLoading) {
    return <>isLoading</>;
  }

  if (!data || !serverId) {
    return <>something went wrong</>;
  }

  return <CreateUpdateGameServerForm data={data} serverId={serverId} />;
};

interface Props {
  data: GameServerOutputDTO;
  serverId: string;
}

const CreateUpdateGameServerForm: FC<Props> = ({ data, serverId }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useGameServerUpdate();
  const {
    mutateAsync: testReachabilityMutation,
    isLoading: testingConnection,
  } = useGameServerReachabilityByConfig();
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

  const onSubmit: SubmitHandler<IFormInputs> = async ({
    name,
    connectionInfo,
  }) => {
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

    if (response.connectable) {
      setConnectionOk(true);
    } else {
      setError(response.reason || 'Connection error');
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>Edit Game Server</DrawerHeading>
        <DrawerBody>
          <CollapseList>
            <form
              onSubmit={handleSubmit(onSubmit)}
              id="update-game-server-form"
            >
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
                  render={(selectedIndex) => (
                    <div>
                      {gameTypeSelectOptions[selectedIndex]?.name ??
                        'Select...'}
                    </div>
                  )}
                >
                  <OptionGroup label="Games">
                    {gameTypeSelectOptions.map(({ name, value }) => (
                      <Option key={`select-${name}`} value={value}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </Option>
                    ))}
                  </OptionGroup>
                </Select>
              </CollapseList.Item>
              <CollapseList.Item title="Connection info">
                {connectionInfoFieldsMap(isLoading, control)[data.type]}
              </CollapseList.Item>
              {error && <ErrorMessage message={error} />}
            </form>
          </CollapseList>
        </DrawerBody>
        <DrawerFooter>
          <ButtonContainer>
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              color="background"
              type="button"
            />
            <Button
              fullWidth
              isLoading={testingConnection}
              onClick={clickTestReachability}
              text="Test connection"
            />
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateUpdateGameServer;
