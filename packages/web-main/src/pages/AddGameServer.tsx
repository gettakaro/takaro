import { FC, useMemo, useState } from 'react';
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
} from '@takaro/lib-components';
import * as yup from 'yup';
import {
  AiFillPlusCircle,
  AiFillControl,
  AiFillQuestionCircle,
} from 'react-icons/ai';
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

interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: Record<string, unknown>;
}

const Container = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 1.5rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SubContainer = styled.div`
  width: 50%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const AddGameServer: FC = () => {
  const [loading, setLoading] = useState(false);
  const [isConnectable, setIsConnectable] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { serverId } = useParams();

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

  const { control, handleSubmit, formState, watch, setValue } =
    useForm<IFormInputs>({
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
      navigate(PATHS.gameServers.overview);
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
        error={formState.errors['connectionInfo.host']}
        placeholder="12.34.56.78:1234"
        key={'host'}
      />,
      <TextField
        control={control}
        label="Admin user"
        name="connectionInfo.adminUser"
        error={formState.errors['connectionInfo.adminUser']}
        placeholder=""
        key={'adminUser'}
      />,
      <TextField
        control={control}
        label="Admin token"
        name="connectionInfo.adminToken"
        type="password"
        error={formState.errors['connectionInfo.adminToken']}
        placeholder=""
        key={'adminToken'}
      />,
      <>
        <p>use TLS?</p>
        <Switch name="connectionInfo.useTls" control={control} />
      </>,
    ],
    [GameServerCreateDTOTypeEnum.Mock]: [
      <TextField
        control={control}
        label="Event interval"
        name="connectionInfo.eventInterval"
        hint="How often the server should send events to the backend (in ms)"
        placeholder="500"
        error={formState.errors['connectionInfo.eventInterval']}
        key={'eventInterval'}
      />,
      <TextField
        control={control}
        label="Player pool size"
        name="connectionInfo.playerPoolSize"
        hint="How large is the pool of fake players"
        placeholder="100"
        error={formState.errors['connectionInfo.playerPoolSize']}
        key={'playerPoolSize'}
      />,
    ],
    [GameServerCreateDTOTypeEnum.Rust]: [
      <TextField
        control={control}
        label="Server IP"
        name="connectionInfo.host"
        error={formState.errors['connectionInfo.host']}
        placeholder="12.34.56.78"
        key={'host'}
      />,
      <TextField
        control={control}
        label="RCON Port"
        name="connectionInfo.rconPort"
        error={formState.errors['connectionInfo.rconPort']}
        placeholder=""
        key={'rconPort'}
      />,
      <TextField
        control={control}
        label="RCON Password"
        name="connectionInfo.rconPassword"
        error={formState.errors['connectionInfo.rconPassword']}
        type="password"
        placeholder=""
        key={'rconPassword'}
      />,
      <>
        <p>use TLS?</p>
        <Switch name="connectionInfo.useTls" control={control} />
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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <SubContainer>
            <div>
              <TextField
                control={control}
                error={formState.errors.name}
                label="Server name"
                loading={loading}
                name="name"
                placeholder="My cool server"
                required
              />
              <Select
                control={control}
                error={formState.errors.type}
                name="type"
                label="Game server"
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
            </div>
            <ErrorMessage message={error} />

            <Row>
              <Button
                icon={<AiFillQuestionCircle />}
                isLoading={checkReachability.isLoading}
                onClick={() => {
                  checkReachability.mutate({
                    connectionInfo: JSON.stringify(watch('connectionInfo')),
                    type: watch('type'),
                  });
                }}
                text="Test connection"
                type="button"
                variant="default"
              />
              {isConnectable && (
                <Button
                  icon={<AiFillPlusCircle />}
                  isLoading={loading}
                  onClick={() => {
                    /* dummy */
                  }}
                  text="Save"
                  type="submit"
                  color="success"
                  variant="default"
                />
              )}
            </Row>
          </SubContainer>

          <SubContainer>
            <h2>Connection info</h2>

            {connectionInfoMap[watch('type')]}
          </SubContainer>
        </Container>
      </form>
    </>
  );
};

export default AddGameServer;
