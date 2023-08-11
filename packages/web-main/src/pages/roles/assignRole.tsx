import { Drawer, CollapseList, FormError, Button, Select, TextField, Loading } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { useRoleAssign, useRoles } from 'queries/roles';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleAssignValidationSchema } from './validationSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { GameServerOutputDTO, RoleOutputDTO } from '@takaro/apiclient';

interface IFormInputs {
  playerId: string;
  roleId: string;
  gameServerId?: string;
}

interface IAssignRoleFormProps {
  roles: RoleOutputDTO[];
  gameServers: GameServerOutputDTO[];
}

export const AssignRole: FC = () => {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: gameservers, isLoading: isLoadingGameServers } = useGameServers();

  if (isLoadingRoles || isLoadingGameServers || !gameservers || !roles) {
    return <Loading />;
  }

  const gameServerOptions = [
    { name: 'Global - applies to all gameservers', id: 'null' } as GameServerOutputDTO,
    ...gameservers.pages.flatMap((page) => page.data),
  ];
  const roleOptions = roles.pages.flatMap((page) => page.data);

  return <AssignRoleForm gameServers={gameServerOptions} roles={roleOptions} />;
};

const AssignRoleForm: FC<IAssignRoleFormProps> = ({ roles, gameServers }) => {
  const [open, setOpen] = useState(true);
  const { mutateAsync, isLoading, error } = useRoleAssign();
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();

  useEffect(() => {
    if (!playerId) {
      navigate(PATHS.players());
      return;
    }

    if (!open) {
      navigate(PATHS.player.profile(playerId));
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(roleAssignValidationSchema),
    defaultValues: {
      playerId,
      roleId: roles[0].id,
      gameServerId: gameServers[0].id,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ playerId, roleId, gameServerId }) => {
    if (gameServerId === 'null') gameServerId = undefined;
    await mutateAsync({ id: playerId, roleId, gameServerId });
    navigate(PATHS.player.profile(playerId));
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Assign role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="create-role-form">
              <CollapseList.Item title="General">
                <TextField readOnly control={control} name="playerId" label="Player" />

                <Select
                  control={control}
                  name="roleId"
                  label="Role"
                  render={(selectedIndex) => (
                    <div>{selectedIndex !== -1 ? roles[selectedIndex].name : roles[0].name}</div>
                  )}
                >
                  <Select.OptionGroup label="Roles">
                    {roles.map((role) => (
                      <Select.Option key={role.id} value={role.id}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select.OptionGroup>
                </Select>

                <Select
                  control={control}
                  name="gameServerId"
                  label="Gameserver"
                  render={(selectedIndex) => (
                    <div>
                      {selectedIndex !== -1 ? gameServers[selectedIndex].name : 'Global - applies to all gameservers'}
                    </div>
                  )}
                >
                  <Select.OptionGroup label="gameservers">
                    {gameServers.map((server) => (
                      <Select.Option key={server.id} value={server.id}>
                        {server.name}
                      </Select.Option>
                    ))}
                  </Select.OptionGroup>
                </Select>
              </CollapseList.Item>
              {error && <FormError error={error} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Save changes" isLoading={isLoading} type="submit" form="create-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
