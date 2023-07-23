import { Loading, Chip } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';

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

  const roleChips = data?.roles.map((role) => <Chip key={role.id} label={role.name} color={'primary'} />);

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
      {roleChips}
      <Chip label={'Add Role'} color={'secondary'} onClick={() => navigate(PATHS.player.assignRole(data.id))} />
      <Outlet />
    </div>
  );
};
