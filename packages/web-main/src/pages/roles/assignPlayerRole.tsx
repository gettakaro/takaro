import { Drawer, CollapseList, FormError, Button, Select, TextField, Loading } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayerRoleAssign, usePlayerRoleUnassign, useRoles } from 'queries/roles';
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { playerRoleAssignValidationSchema } from './validationSchema';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { GameServerOutputDTO, RoleAssignmentOutputDTO, RoleOutputDTO } from '@takaro/apiclient';
import { usePlayer } from 'queries/players';

interface IFormInputs {
  id: string;
  roleIds: string[];
  gameServerId: string | null;
}

interface IAssignRoleFormProps {
  gameServers: GameServerOutputDTO[];
  assignedRoles: RoleAssignmentOutputDTO[];
  roles: RoleOutputDTO[];
  defaultSelectedServerId?: string;
}

export const AssignPlayerRole: FC = () => {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: gameservers, isLoading: isLoadingGameServers } = useGameServers();
  const { playerId } = useParams();
  const { data: player, isLoading: isLoadingPlayer } = usePlayer(playerId!);

  // TODO: if gameservers is null it is probably because of an error
  if (isLoadingRoles || isLoadingGameServers || !gameservers || !roles || isLoadingPlayer) {
    return <Loading />;
  }

  const assignedRoleIds = player?.roleAssignments;
  const roleOptions = roles.pages.flatMap((page) => page.data);

  const gameServerOptions = [
    { name: 'Global - applies to all gameservers', id: 'global' } as GameServerOutputDTO,
    ...gameservers.pages.flatMap((page) => page.data),
  ];

  return <AssignRoleForm gameServers={gameServerOptions} roles={roleOptions} assignedRoles={assignedRoleIds ?? []} />;
};

const AssignRoleForm: FC<IAssignRoleFormProps> = ({ gameServers, assignedRoles, roles, defaultSelectedServerId }) => {
  const [open, setOpen] = useState(true);
  const {
    mutateAsync: assignRoleMutate,
    isLoading: isLoadingRoleAssign,
    error: errorAssignRole,
  } = usePlayerRoleAssign();
  const {
    mutateAsync: unAssignRoleMutate,
    isLoading: isLoadingRoleUnAssign,
    error: errorUnAssignRole,
  } = usePlayerRoleUnassign();

  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();

  const { control, handleSubmit, setValue } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(playerRoleAssignValidationSchema),
    defaultValues: {
      id: playerId,
      gameServerId: defaultSelectedServerId ?? 'global',
    },
  });
  const { gameServerId } = useWatch({ control });

  const filterAssignedRoles = useCallback(
    (serverId: string) => {
      if (serverId === 'global') {
        return assignedRoles.filter((role) => role.gameServerId === null).map((ass) => ass.role);
      }
      return assignedRoles.filter((role) => role.gameServerId === serverId).map((ass) => ass.role);
    },
    [assignedRoles]
  );

  useEffect(() => {
    if (!playerId) {
      navigate(PATHS.players());
      return;
    }

    if (!open) {
      navigate(PATHS.player.profile(playerId));
    }
  }, [open, navigate]);

  useEffect(() => {
    setValue(
      'roleIds',
      filterAssignedRoles(gameServerId!).map((r) => r.id)
    );
  }, [gameServerId]);

  const onSubmit: SubmitHandler<IFormInputs> = async ({ id, roleIds, gameServerId }) => {
    if (gameServerId === 'global') gameServerId = null;
    // roleIds are all selected indices
    // part of roleIds but not part of (previously) assignedRoles.
    const newAssignments = roleIds
      .filter((roleId) => !assignedRoles.some((role) => role.roleId === roleId && role.gameServerId === gameServerId))
      .map((roleId) => assignRoleMutate({ id, roleId, gameServerId: gameServerId ?? undefined }));

    // Not part of roleIds but part of (previously) assignedRoles.
    // NOTE: make sure to use role.roleId and not role.id
    const removedAssignments = assignedRoles
      .filter(
        (assignedRole) =>
          !roleIds.some((roleId) => assignedRole.roleId === roleId && assignedRole.gameServerId === gameServerId)
      )
      .map((assignedRole) =>
        unAssignRoleMutate({ id, roleId: assignedRole.roleId, gameServerId: gameServerId ?? undefined })
      );
    await Promise.all([...newAssignments, ...removedAssignments]);
    navigate(PATHS.player.profile(id));
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Assign role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="create-role-form">
              <CollapseList.Item title="General">
                <TextField readOnly control={control} name="id" label="Player" />

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

                <Select
                  control={control}
                  multiSelect
                  name="roleIds"
                  label="Roles"
                  inPortal
                  enableFilter
                  render={(selectedIndices) => (
                    <div>
                      {selectedIndices.length === 0
                        ? 'Select...'
                        : selectedIndices.length <= 3
                        ? selectedIndices.map((index) => roles[index]?.name).join(', ')
                        : `${selectedIndices
                            .slice(0, 3)
                            .map((index) => roles[index]?.name)
                            .join(', ')} and ${selectedIndices.length - 3} more`}
                    </div>
                  )}
                >
                  <Select.OptionGroup label="Roles">
                    {roles.map((role) => (
                      <Select.Option key={role.id} value={role.id} label={role.name}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select.OptionGroup>
                </Select>
              </CollapseList.Item>
              {errorAssignRole && <FormError error={errorAssignRole} />}
              {errorUnAssignRole && <FormError error={errorUnAssignRole} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button
              fullWidth
              text="Save changes"
              isLoading={isLoadingRoleUnAssign || isLoadingRoleAssign}
              type="submit"
              form="create-role-form"
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
