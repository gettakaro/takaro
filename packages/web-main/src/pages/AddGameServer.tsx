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
} from '@takaro/lib-components';
import * as yup from 'yup';
import { AiFillPlusCircle, AiFillControl } from 'react-icons/ai';
import { GameServerCreateDTOTypeEnum, GameServerOutputDTO } from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';

interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: {
    eventInterval?: number;
    adminUser?: string;
    adminToken?: string;
    password?: string;
    useTls?: boolean;
  };
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

interface IAddGameServerProps {
  server?: GameServerOutputDTO;
}

const AddGameServer: FC<IAddGameServerProps> = ({server}: IAddGameServerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const apiClient = useApiClient();

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

  const { control, handleSubmit, formState, reset, watch } =
    useForm<IFormInputs>({
      mode: 'onSubmit',
      resolver: useValidationSchema(validationSchema),
    });

  const onSubmit: SubmitHandler<IFormInputs> = async (inputs) => {
    setLoading(true);
    setError(undefined);

    try {
      await apiClient.gameserver.gameServerControllerCreate({
        connectionInfo: JSON.stringify(inputs.connectionInfo),
        name: inputs.name,
        type: inputs.type,
      });
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
        name="connectionInfo.ip"
        error={formState.errors['connectionInfo.ip']}
        placeholder="12.34.56.78:1234"
        key={'ip'}
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
      type='password'
      error={formState.errors['connectionInfo.adminToken']}
      placeholder=""
      key={'adminToken'}
    />,
    <>
      <p>use TLS?</p>
      <Switch name='connectionInfo.useTls' control={control} />
    </>,
    ],
    [GameServerCreateDTOTypeEnum.Mock]: [
      <TextField
        control={control}
        label="Event interval"
        name="connectionInfo.eventInterval"
        hint='How often the server should send events to the backend (in ms)'
        placeholder="500"
        error={formState.errors['connectionInfo.eventInterval']}
        key={'eventInterval'}
      />,
    ],
    [GameServerCreateDTOTypeEnum.Rust]: [
      <TextField
      control={control}
      label="IP (or FQDN), including port"
      name="connectionInfo.ip"
      error={formState.errors['connectionInfo.ip']}
      placeholder="12.34.56.78:1234"
      key={'ip'}
    />,
    <TextField
      control={control}
      label="Password"
      name="connectionInfo.password"
      error={formState.errors['connectionInfo.password']}
      type='password'
      placeholder=""
      key={'password'}
    />,
    <>
      <p>use TLS?</p>
      <Switch name='connectionInfo.useTls' control={control} />
    </>,
    ],
  };

  return (
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
            text="Add server"
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
  );
};

export default AddGameServer;
