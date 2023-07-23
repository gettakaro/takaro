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

interface IFormInputs {
  playerId: string;
  roleId: string;
  gameServerId?: string;
}

export const AssignRoleForm: FC = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isLoading } = useRoleAssign();
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: gameservers, isLoading: isLoadingGameServers } = useGameServers();

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
      roleId: '',
      gameServerId: '',
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ playerId, roleId, gameServerId }) => {
    try {
      await mutateAsync({ id: playerId, roleId, gameServerId });

      navigate(PATHS.player.profile(playerId));
    } catch (error) {
      setError('Something went wrong, please try again later');
    }
  };

  if (isLoadingRoles || isLoadingGameServers) {
    return <Loading />;
  }

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
                    <div>
                      {selectedIndex !== -1
                        ? roles?.pages.flatMap((page) => page.data)[selectedIndex].name
                        : roles?.pages.flatMap((page) => page.data)[0].name}
                    </div>
                  )}
                >
                  <Select.OptionGroup label="Roles">
                    {roles?.pages
                      .flatMap((page) => page.data)
                      .map((role) => (
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
                      {selectedIndex !== -1
                        ? gameservers?.pages.flatMap((page) => page.data)[selectedIndex].name
                        : 'Global - applies to all gameservers'}
                    </div>
                  )}
                >
                  <Select.OptionGroup label="gameservers">
                    <Select.Option value={''}>{'Global'}</Select.Option>
                    {gameservers?.pages
                      .flatMap((page) => page.data)
                      .map((role) => (
                        <Select.Option key={role.id} value={role.id}>
                          {role.name}
                        </Select.Option>
                      ))}
                  </Select.OptionGroup>
                </Select>
              </CollapseList.Item>
              {error && <FormError message={error} />}
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
