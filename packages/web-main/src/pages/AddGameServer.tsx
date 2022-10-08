import { FC, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Select,
  TextField,
  useValidationSchema,
  styled,
  Switch,
  ErrorMessage,
  Loading,
} from '@takaro/lib-components';
import * as yup from 'yup';
import { AiFillPlusCircle, AiFillControl } from 'react-icons/ai';
import {
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTOAPI,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useQuery } from 'react-query';
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

const SubContainer = styled.div`
  width: 50%;
  padding: 2rem;
`;

const AddGameServer: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { serverId } = useParams();

  const { data, isLoading, refetch } = useQuery<
    GameServerOutputDTOAPI['data'] | null
  >(`gameserver/${serverId}`, async () => {
    if (!serverId) return null;
    return (await apiClient.gameserver.gameServerControllerGetOne(serverId))
      .data.data;
  });

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

  const defaultValues = () => {
    if (!serverId) return undefined;
    if (!data) return undefined;

    return {
      connectionInfo: data.connectionInfo as unknown as Record<string, never>,
      name: data.name,
      type: data.type,
    };
  };

  const { control, handleSubmit, formState, reset, watch } =
    useForm<IFormInputs>({
      mode: 'onSubmit',
      resolver: useValidationSchema(validationSchema),
      defaultValues: defaultValues(),
    });

  const onSubmit: SubmitHandler<IFormInputs> = async (inputs) => {
    setLoading(true);
    setError(undefined);

    try {
      if (!serverId) {
        await apiClient.gameserver.gameServerControllerCreate({
          connectionInfo: JSON.stringify(inputs.connectionInfo),
          name: inputs.name,
          type: inputs.type,
        });
      } else {
        await apiClient.gameserver.gameServerControllerUpdate(serverId, {
          connectionInfo: JSON.stringify(inputs.connectionInfo),
          name: inputs.name,
          type: inputs.type,
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
        label="IP (or FQDN), including port"
        name="connectionInfo.host"
        error={formState.errors['connectionInfo.host']}
        placeholder="12.34.56.78:1234"
        key={'host'}
      />,
      <TextField
        control={control}
        label="Password"
        name="connectionInfo.password"
        error={formState.errors['connectionInfo.password']}
        type="password"
        placeholder=""
        key={'password'}
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <SubContainer>
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
              icon={<AiFillControl />}
              error={formState.errors.type}
              label=""
              readOnly={!!serverId}
              name="type"
              options={[
                { label: 'Rust', value: GameServerCreateDTOTypeEnum.Rust },
                {
                  label: '7 Days to die',
                  value: GameServerCreateDTOTypeEnum.Sevendaystodie,
                },
                {
                  label: 'Mock (testing purposes)',
                  value: GameServerCreateDTOTypeEnum.Mock,
                },
              ]}
              placeholder="Select your game"
            />

            <ErrorMessage message={error} />

            <Button
              icon={<AiFillPlusCircle />}
              isLoading={loading}
              onClick={() => {
                /* dummy */
              }}
              text="Save"
              type="submit"
              variant="default"
            />
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
