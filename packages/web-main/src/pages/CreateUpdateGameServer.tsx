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
  Switch,
  ErrorMessage,
  Loading,
  DrawerContent,
  DrawerHeading,
  Drawer,
  CollapseList,
} from '@takaro/lib-components';
import * as yup from 'yup';
import { AiFillQuestionCircle as TestConnectionIcon } from 'react-icons/ai';
import {
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTOAPI,
  GameServerTestReachabilityInputDTO,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import {
  DrawerBody,
  DrawerFooter,
} from '@takaro/lib-components/src/components/data/Drawer';

interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: Record<string, unknown>;
}

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CreateUpdateGameServer: FC = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isConnectable, setIsConnectable] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { serverId } = useParams();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServers.overview());
    }
  }, [open, navigate]);

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup.string().required('Must provide a name for the server.'),
        type: yup
          .mixed()
          .oneOf([Object.values(GameServerCreateDTOTypeEnum)])
          .required('Must provide a type for the server.'),
        'connectionInfo.eventInterval': yup
          .number()
          .min(100, 'Must be at least 100 ms'),
      }),
    []
  );

  const checkReachability = useMutation({
    mutationFn: async (info: GameServerTestReachabilityInputDTO) => {
      const res =
        await apiClient.gameserver.gameServerControllerTestReachability(info);

      setIsConnectable(res.data.data.connectable);
      setError(res.data.data.reason);

      return res;
    },
  });

  const { control, handleSubmit, watch, setValue } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema),
  });

  const { isLoading, refetch } = useQuery<
    GameServerOutputDTOAPI['data'] | null
  >(`gameserver/${serverId}`, async () => {
    if (!serverId) return null;
    const resp = (
      await apiClient.gameserver.gameServerControllerGetOne(serverId)
    ).data.data;
    setValue('name', resp.name);
    setValue('type', resp.type);
    setValue('connectionInfo', resp.connectionInfo as Record<string, unknown>);
    return resp;
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({
    name,
    type,
    connectionInfo,
  }) => {
    setLoading(true);
    setError(undefined);

    try {
      if (!serverId) {
        await apiClient.gameserver.gameServerControllerCreate({
          connectionInfo: JSON.stringify(connectionInfo),
          name,
          type,
        });
      } else {
        await apiClient.gameserver.gameServerControllerUpdate(serverId, {
          connectionInfo: JSON.stringify(connectionInfo),
          name,
          type,
        });
        refetch();
      }
      navigate(PATHS.gameServer.dashboard(serverId!));
    } catch (error) {
      setError(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const connectionInfoMap = {
    [GameServerCreateDTOTypeEnum.Sevendaystodie]: [
      <TextField
        control={control}
        label="IP (or FQDN), including port"
        name="connectionInfo.host"
        placeholder="12.34.56.78:1234"
        key={'host'}
      />,
      <TextField
        control={control}
        label="Admin user"
        name="connectionInfo.adminUser"
        placeholder=""
        key={'adminUser'}
      />,
      <TextField
        control={control}
        label="Admin token"
        name="connectionInfo.adminToken"
        type="password"
        placeholder=""
        key={'adminToken'}
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          control={control}
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
        key={'eventInterval'}
      />,
      <TextField
        control={control}
        label="Player pool size"
        name="connectionInfo.playerPoolSize"
        description="How large is the pool of fake players"
        placeholder="100"
        key={'playerPoolSize'}
      />,
    ],
    [GameServerCreateDTOTypeEnum.Rust]: [
      <TextField
        control={control}
        label="Server IP"
        name="connectionInfo.host"
        placeholder="12.34.56.78"
        key={'host'}
      />,
      <TextField
        control={control}
        label="RCON Port"
        name="connectionInfo.rconPort"
        placeholder=""
        key={'rconPort'}
      />,
      <TextField
        control={control}
        label="RCON Password"
        name="connectionInfo.rconPassword"
        type="password"
        placeholder=""
        key={'rconPassword'}
      />,
      <>
        <Switch
          label="Use TLS"
          name="connectionInfo.useTls"
          control={control}
        />
      </>,
    ],
  };

  if (isLoading) {
    return <Loading />;
  }

  const gameTypeOptions = [
    { name: 'Rust', value: GameServerCreateDTOTypeEnum.Rust },
    {
      name: '7 Days to die',
      value: GameServerCreateDTOTypeEnum.Sevendaystodie,
    },
    {
      name: 'Mock (testing purposes)',
      value: GameServerCreateDTOTypeEnum.Mock,
    },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>
          {serverId ? 'Update game server' : 'Create game server'}
        </DrawerHeading>
        <DrawerBody>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} name="addupdategamserver">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Server name"
                  loading={loading}
                  name="name"
                  placeholder="My cool server"
                  required
                />

                <Select
                  control={control}
                  name="type"
                  label="Game server"
                  required={true}
                  render={(selectedIndex) => (
                    <div>
                      {gameTypeOptions[selectedIndex]?.name ?? 'Select...'}
                    </div>
                  )}
                >
                  <OptionGroup label="Games">
                    {gameTypeOptions.map(({ name, value }) => (
                      <Option key={name} value={value}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </Option>
                    ))}
                  </OptionGroup>
                </Select>
              </CollapseList.Item>
              {connectionInfoMap[watch('type')] && (
                <CollapseList.Item title="Connection info">
                  {connectionInfoMap[watch('type')]}
                  {error && <ErrorMessage message={error} />}
                  <Button
                    icon={<TestConnectionIcon />}
                    isLoading={checkReachability.isLoading}
                    onClick={() => {
                      checkReachability.mutate({
                        connectionInfo: JSON.stringify(watch('connectionInfo')),
                        type: watch('type'),
                      });
                    }}
                    fullWidth={true}
                    text="Test connection"
                    type="button"
                    variant="default"
                  />
                </CollapseList.Item>
              )}
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
            <Button
              fullWidth
              text="Save changes"
              type="submit"
              form="addupdategamserver"
              disabled={!isConnectable}
            />
          </ButtonContainer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateUpdateGameServer;
