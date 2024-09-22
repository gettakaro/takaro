import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Button, CollapseList, Drawer } from '@takaro/lib-components';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { CardList } from 'components/cards';
import { GameServerSelect } from 'components/selects';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions, usersQueryOptions } from 'queries/user';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ManageIdentityCard } from './-roles/ManagerView';

export const Route = createFileRoute('/_auth/_global/roles/$roleId/users')({
  component: Component,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_ROLES', 'READ_USERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      ...usersQueryOptions({ filters: { roleId: [params.roleId] } }),
    });
  },
});

function Component() {
  const users = Route.useLoaderData();
  const { roleId } = Route.useParams();
  const [open, setOpen] = useState(true);
  const navigate = Route.useNavigate();

  const { control, watch } = useForm<{ gameServerId: string }>();
  const gameServerId = watch('gameServerId');

  useEffect(() => {
    if (!open) {
      navigate({ to: '/roles' });
    }
  }, [open, navigate]);

  const usersWithRoleGloballyAssigned = users.data.filter((user) =>
    (user as UserOutputWithRolesDTO).roles.some((role) => role.gameServerId === undefined),
  );

  const usersWithGameServerRoleAssigned = useMemo(() => {
    if (gameServerId === undefined) {
      return [];
    } else {
      return users.data.filter((user) =>
        (user as UserOutputWithRolesDTO).roles.some((assignment) => assignment.gameServerId === gameServerId),
      );
    }
  }, [gameServerId]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Manage Users</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="Global">
              <CardList>
                {usersWithRoleGloballyAssigned.map((user) => (
                  <Link
                    key={user.id}
                    style={{ display: 'flex', width: '100%' }}
                    to="/user/$userId"
                    target="_blank"
                    params={{ userId: user.id }}
                  >
                    <ManageIdentityCard id={user.id} name={user.name} roleId={roleId} />
                  </Link>
                ))}
              </CardList>
            </CollapseList.Item>
            <CollapseList.Item collapsed={true} title="Gameserver">
              <GameServerSelect name="gameServerId" canClear={false} control={control} />
              <CardList>
                {usersWithGameServerRoleAssigned.map((user) => (
                  <Link
                    key={gameServerId + user.id}
                    style={{ display: 'flex', width: '100%' }}
                    to="/user/$userId"
                    target="_blank"
                    params={{ userId: user.id }}
                  >
                    <ManageIdentityCard id={user.id} name={user.name} roleId={roleId} gameServerId={gameServerId} />
                  </Link>
                ))}
              </CardList>
            </CollapseList.Item>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <Button fullWidth text="Close view" type="submit" onClick={() => setOpen(false)} />
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
