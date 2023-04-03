// todo: this is deprecated in favor of a dialog version

import { FC, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Select,
  OptionGroup,
  Option,
  TextField,
  useValidationSchema,
  styled,
  DrawerContent,
  DrawerHeading,
  Drawer,
  CollapseList,
  Tooltip,
  Switch,
  ErrorMessage,
} from '@takaro/lib-components';
import * as yup from 'yup';
import {
  GameServerCreateDTO,
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTOAPI,
  GameServerTestReachabilityDTOAPI,
  GameServerUpdateDTO,
  MockConnectionInfo,
  RustConnectionInfo,
  SdtdConnectionInfo,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import {
  DrawerBody,
  DrawerFooter,
} from '@takaro/lib-components/src/components/data/Drawer';
import * as Sentry from '@sentry/react';
import { QueryKeys } from 'queryKeys';
import { useSnackbar } from 'notistack';

type ConnectionInfo =
  | MockConnectionInfo
  | RustConnectionInfo
  | SdtdConnectionInfo;

interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: ConnectionInfo;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const connectionInfoValidationSchemaMap = {
  [GameServerCreateDTOTypeEnum.Sevendaystodie]: yup.object({
    host: yup.string().required(),
    adminUser: yup.string().required(),
    adminToken: yup.string().required(),
    useTls: yup.bool().required(),
  }),
  [GameServerCreateDTOTypeEnum.Mock]: yup.object({
    eventInterval: yup.number().min(500).required(),
    playerPoolSize: yup.number().max(200).required(),
  }),
  [GameServerCreateDTOTypeEnum.Rust]: yup.object({
    host: yup.string().required(),
    rconPort: yup.number().required(),
    rconPassword: yup.string().required(),
    useTls: yup.bool().required(),
  }),
};

const CreateUpdateGameServer: FC = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { serverId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [gameServerType, setGameServerType] =
    useState<GameServerCreateDTOTypeEnum>(GameServerCreateDTOTypeEnum.Rust);

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServers.overview());
    }
  }, [open, navigate]);

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .min(4)
          .max(25)
          .required('Must provide a name for the server.'),
        type: yup
          .mixed()
          .oneOf([Object.values(GameServerCreateDTOTypeEnum)])
          .required('Must provide a type for the server.'),
        connectionInfo: connectionInfoValidationSchemaMap[gameServerType],
      }),
    [gameServerType]
  );

  const testReachability = useMutation({
    mutationKey: ['server-reachability', serverId],
    mutationFn: async (info) => {
      apiClient.gameserver.gameServerControllerTestReachability(info!);
    },
    onError: (data: GameServerTestReachabilityDTOAPI) => {
      setError(data.data.reason!);
    },
  });

  const createGameServer = useMutation({
    mutationKey: ['server-create', serverId],
    mutationFn: async (gameServer: GameServerCreateDTO) => {
      apiClient.gameserver.gameServerControllerCreate(gameServer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.gameserver.list);
      enqueueSnackbar('Server has been created', { variant: 'default' });
    },
  });

  const updateGameServer = useMutation({
    mutationKey: ['server-update', serverId],
    mutationFn: async (gameServer: GameServerUpdateDTO) => {
      apiClient.gameserver.gameServerControllerUpdate(serverId!, gameServer);
    },
    onSuccess: () => queryClient.invalidateQueries(QueryKeys.gameserver.list),
  });

  const { control, handleSubmit, watch, setValue } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: useValidationSchema(validationSchema),
    defaultValues: {
      type: gameServerType,
    },
  });

  useEffect(() => {
    setGameServerType(watch('type'));
  }, [watch('type')]);

  const { isLoading } = useQuery<GameServerOutputDTOAPI['data'] | null>(
    `gameserver/${serverId}`,
    async () => {
      if (!serverId) return null;
      const resp = (
        await apiClient.gameserver.gameServerControllerGetOne(serverId)
      ).data.data;
      setValue('name', resp.name);
      setValue('type', resp.type);
      setGameServerType(resp.type);
      return resp;
    }
  );

  const onSubmit: SubmitHandler<IFormInputs> = async ({
    name,
    type,
    connectionInfo,
  }) => {
    setError('');
    let filteredConnInfo = Object.fromEntries(
      Object.entries(connectionInfo).filter(([_, v]) => v != null)
    );

    try {
      await testReachability.mutateAsync(filteredConnInfo as ConnectionInfo);

      if (!serverId) {
        await createGameServer.mutateAsync({
          name,
          type,
          connectionInfo: JSON.stringify(filteredConnInfo),
        });
      } else {
        await updateGameServer.mutateAsync({
          name,
          type,
          connectionInfo: JSON.stringify(filteredConnInfo),
        });
      }
      navigate(PATHS.gameServers.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const ConnectionInfoFields = {
    [GameServerCreateDTOTypeEnum.Sevendaystodie]: [
      <TextField
        control={control}
        label="IP (or FQDN), including port"
        name="connectionInfo.host"
        placeholder="12.34.56.78:1234"
        key="host"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="Admin user"
        name="connectionInfo.adminUser"
        placeholder=""
        key="adminuser"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="Admin token"
        name="connectionInfo.adminToken"
        type="password"
        placeholder=""
        key="adminToken"
        loading={isLoading}
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          control={control}
          loading={isLoading}
        />
      </>,
    ],
    [GameServerCreateDTOTypeEnum.Mock]: [
      <TextField
        control={control}
        label="Event interval"
        name="connectionInfo.eventInterval"
        description="How often the server should send events to the backend (in ms)"
        placeholder="500"
        key="eventInterval"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="Player pool size"
        name="connectionInfo.playerPoolSize"
        description="How large is the pool of fake players"
        placeholder="100"
        key="playerPoolSize"
        loading={isLoading}
      />,
    ],
    [GameServerCreateDTOTypeEnum.Rust]: [
      <TextField
        control={control}
        label="Server IP"
        name="connectionInfo.host"
        placeholder="12.34.56.78"
        key="host"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="RCON Port"
        name="connectionInfo.rconPort"
        placeholder=""
        key="rconPort"
        loading={isLoading}
      />,
      <TextField
        control={control}
        label="RCON Password"
        name="connectionInfo.rconPassword"
        type="password"
        placeholder=""
        key="rconPassword"
        loading={isLoading}
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          control={control}
          loading={isLoading}
        />
      </>,
    ],
  };

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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>
          {serverId ? 'Update game server' : 'Create game server'}
        </DrawerHeading>
        <DrawerBody>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                  required={true}
                  loading={isLoading}
                  render={(selectedIndex) => (
                    <div>
                      {gameTypeSelectOptions[selectedIndex]?.name ??
                        'Select...'}
                    </div>
                  )}
                >
                  <OptionGroup label="Games">
                    {gameTypeSelectOptions.map(({ name, value }) => (
                      <Option key={name} value={value}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </Option>
                    ))}
                  </OptionGroup>
                </Select>
              </CollapseList.Item>
              {watch('type') !== undefined && (
                <CollapseList.Item title="Connection info">
                  {ConnectionInfoFields[watch('type')]}
                </CollapseList.Item>
              )}
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
            />
            <Tooltip label="You need to test the connection before we can save">
              <Button fullWidth text="Save changes" type="submit" />
            </Tooltip>
          </ButtonContainer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateUpdateGameServer;
