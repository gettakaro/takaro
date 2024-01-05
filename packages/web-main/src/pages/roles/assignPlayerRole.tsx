import {
  Drawer,
  CollapseList,
  FormError,
  Button,
  SelectField,
  TextField,
  DatePicker,
  DrawerSkeleton,
} from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayerRoleAssign, useRoles } from 'queries/roles';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleAssignValidationSchema } from './validationSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { GameServerOutputDTO, RoleOutputDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';
import { RolesSelect } from 'components/selects';

interface IFormInputs {
  id: string;
  roleId: string;
  gameServerId?: string;
  expiresAt?: string;
}

interface IAssignRoleFormProps {
  roles: RoleOutputDTO[];
  gameServers: GameServerOutputDTO[];
}

export const AssignPlayerRole: FC = () => {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: gameservers, isLoading: isLoadingGameServers } = useGameServers();

  if (isLoadingRoles || isLoadingGameServers || !gameservers || !roles) {
    return <DrawerSkeleton />;
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
  const { mutateAsync, isLoading, error } = usePlayerRoleAssign();
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
      id: playerId,
      roleId: roles[0].id,
      gameServerId: gameServers[0].id,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ id, roleId, gameServerId, expiresAt }) => {
    if (gameServerId === 'null') gameServerId = undefined;
    await mutateAsync({ id, roleId, gameServerId, expiresAt });
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

                <RolesSelect control={control} name="roleId" />

                <SelectField
                  control={control}
                  name="gameServerId"
                  label="Gameserver"
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      // in case nothing is selected, we default to global
                      return <div>Global - applies to all gameservers</div>;
                    }
                    return <div>{selectedItems[0].label}</div>;
                  }}
                >
                  <SelectField.OptionGroup label="gameservers">
                    {gameServers.map((server) => (
                      <SelectField.Option key={server.id} value={server.id} label={server.name}>
                        {server.name}
                      </SelectField.Option>
                    ))}
                  </SelectField.OptionGroup>
                </SelectField>

                <DatePicker
                  mode="absolute"
                  control={control}
                  label={'Expiration date'}
                  name={'expiresAt'}
                  required={false}
                  loading={isLoading}
                  description={'The role will be automatically removed after this date'}
                  popOverPlacement={'bottom'}
                  allowPastDates={false}
                  timePickerOptions={{ interval: 30 }}
                  format={DateTime.DATETIME_SHORT}
                />
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
