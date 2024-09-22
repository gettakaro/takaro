import { PlayerOutputWithRolesDTO } from '@takaro/apiclient';
import { styled, Button, CollapseList, Drawer } from '@takaro/lib-components';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { GameServerSelect } from 'components/selects';
import { hasPermission } from 'hooks/useHasPermission';
import { playersQueryOptions } from 'queries/player';
import { userMeQueryOptions } from 'queries/user';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ManageIdentityCard } from './-roles/ManagerView';

const CardList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

export const Route = createFileRoute('/_auth/_global/roles/$roleId/players')({
  component: Component,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_ROLES', 'READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData({
      ...playersQueryOptions({ filters: { roleId: [params.roleId] } }),
    });
  },
});

function Component() {
  const players = Route.useLoaderData();
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

  const playersWithRoleGloballyAssigned = players.data.filter((player) =>
    (player as PlayerOutputWithRolesDTO).roleAssignments.some((assignment) => assignment.gameServerId === undefined),
  );

  const playersWithGameServerRoleAssigned = useMemo(() => {
    if (gameServerId === undefined) {
      return [];
    } else {
      return players.data.filter((player) =>
        (player as PlayerOutputWithRolesDTO).roleAssignments.some(
          (assignment) => assignment.gameServerId === gameServerId,
        ),
      );
    }
  }, [gameServerId]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Manage players</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <CollapseList.Item title="Global">
              <CardList>
                {playersWithRoleGloballyAssigned.map((player) => (
                  <Link
                    key={player.id}
                    style={{ display: 'flex', width: '100%' }}
                    to="/player/$playerId"
                    target="_blank"
                    params={{ playerId: player.id }}
                  >
                    <ManageIdentityCard id={player.id} name={player.name} avatar={player.steamAvatar} roleId={roleId} />
                  </Link>
                ))}
              </CardList>
            </CollapseList.Item>
            <CollapseList.Item title="Gameserver" collapsed>
              <GameServerSelect name="gameServerId" canClear={false} control={control} />
              <CardList>
                {playersWithGameServerRoleAssigned.map((player) => (
                  <Link
                    key={player.id}
                    style={{ display: 'flex', width: '100%' }}
                    to="/player/$playerId"
                    target="_blank"
                    params={{ playerId: player.id }}
                  >
                    <ManageIdentityCard id={player.id} name={player.name} avatar={player.steamAvatar} roleId={roleId} />
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
