import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Select, TextField, Drawer, CollapseList } from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GameServerCreateDTOTypeEnum,
  MockConnectionInfo,
  RustConnectionInfo,
  SdtdConnectionInfo,
} from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { useGameServerCreate, useGameServerReachabilityByConfig } from 'queries/gameservers';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { validationSchema } from './validationSchema';

export interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: MockConnectionInfo | RustConnectionInfo | SdtdConnectionInfo;
}

const CreateGameServer: FC = () => {
  const [open, setOpen] = useState(true);
  const [connectionOk, setConnectionOk] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useGameServerCreate();
  const { mutateAsync: testReachabilityMutation, isLoading: testingConnection } = useGameServerReachabilityByConfig();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServers.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit, watch } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ type, connectionInfo, name }) => {
    try {
      mutateAsync({
        type,
        name,
        connectionInfo: JSON.stringify(connectionInfo),
      });

      navigate(PATHS.gameServers.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const { type, connectionInfo, name } = watch();

  const clickTestReachability = async () => {
    const response = await testReachabilityMutation({
      type,
      connectionInfo: JSON.stringify(connectionInfo),
    });

    if (response.connectable) {
      setConnectionOk(true);
    } // else {
    //setError(response.data.data.reason || 'Connection error');
    //}
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
      <Drawer.Content>
        <Drawer.Heading>Create Game Server</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="create-game-server-form">
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
              {type !== undefined && (
                <CollapseList.Item title="Connection info">
                  {connectionInfoFieldsMap(isLoading, control)[type]}
                </CollapseList.Item>
              )}
              {/* error && <ErrorMessage message={error} /> */}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
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

export default CreateGameServer;
