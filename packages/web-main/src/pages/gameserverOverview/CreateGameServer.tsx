import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, SelectField, TextField, Drawer, CollapseList, FormError } from '@takaro/lib-components';
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
import { useGameServerCreate, useGameServerReachabilityByConfig } from 'queries/gameservers';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { validationSchema } from './validationSchema';
import { gameTypeSelectOptions } from './GameTypeSelectOptions';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';

export interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: MockConnectionInfo | RustConnectionInfo | SdtdConnectionInfo;
}

export const CreateGameServer: FC = () => {
  const [open, setOpen] = useState(true);
  const [reachabilityError, setReachabilityError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutateAsync, isPending, error: gameServerCreateError } = useGameServerCreate();
  const { mutateAsync: testReachabilityMutation, isPending: testingConnection } = useGameServerReachabilityByConfig();
  const { setSelectedGameServerId } = useSelectedGameServer();

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
      const newGameServer = await mutateAsync({
        type,
        name,
        connectionInfo: JSON.stringify(connectionInfo),
      });

      // set the new gameserver as selected.
      setSelectedGameServerId(newGameServer.id);
      navigate(PATHS.gameServers.overview());
    } catch {}
  };

  const { type, connectionInfo, name } = watch();

  const clickTestReachability = async () => {
    const response = await testReachabilityMutation({
      type,
      connectionInfo: JSON.stringify(connectionInfo),
    });

    if (response.connectable) {
      setConnectionOk(true);
      setReachabilityError(null);
    } else {
      setReachabilityError(response.reason || 'Connection error');
    }
  };

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
              {type !== undefined && (
                <CollapseList.Item title="Connection info">
                  {connectionInfoFieldsMap(isPending, control)[type]}
                </CollapseList.Item>
              )}
              {reachabilityError && <FormError error={reachabilityError} />}
              {gameServerCreateError && <FormError error={gameServerCreateError} />}
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
