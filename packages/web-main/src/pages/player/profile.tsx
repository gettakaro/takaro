import { Loading, Chip } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';

interface ISlimmedDownAssignment {
  gameServer?: string;
  role: string;
}

export const PlayerProfile: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Loading />;
  }

  const { data, isLoading } = usePlayer(playerId);

  if (isLoading || !data) {
    return <Loading />;
  }

  // Group assignments per server
  const roleAssignments = data?.roleAssignments.reduce(
    (acc, assignment) => {
      if (assignment.gameServerId) {
        if (!acc[assignment.gameServerId]) {
          acc[assignment.gameServerId] = [];
        }
        acc[assignment.gameServerId].push({ gameServer: assignment.gameServerId, role: assignment.role.name });
      } else {
        acc.all.push({ gameServer: assignment.gameServerId, role: assignment.role.name });
      }
      return acc;
    },
    { all: [] as ISlimmedDownAssignment[] }
  );

  return (
    <div>
      <h1>{data?.name}</h1>
      <ul>
        <li>Takaro ID: {data?.id}</li>
        <li>Created at: {data?.createdAt}</li>
        <li>Updated at: {data?.updatedAt}</li>
        <li>Steam ID: {data?.steamId}</li>
        <li>EOS ID: {data?.epicOnlineServicesId}</li>
        <li>Xbox ID: {data?.xboxLiveId}</li>
      </ul>
      <h2>Roles</h2>
      <pre>{JSON.stringify(roleAssignments, null, 2)}</pre>
      <Chip label={'Add Role'} color={'secondary'} onClick={() => navigate(PATHS.player.assignRole(data.id))} />
      <Outlet />
    </div>
  );
};
