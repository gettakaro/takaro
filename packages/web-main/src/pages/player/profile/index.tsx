import { Stats, styled, Loading, Divider, Chip } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { DateTime } from 'luxon';
import { SiEpicgames as EpicGamesIcon } from 'react-icons/si';
import { FaSteam as SteamIcon, FaXbox as XboxIcon, FaLeaf as TakaroIcon } from 'react-icons/fa';
import { PlayerRolesTable } from './PlayerRolesTable';
import { PlayerInventoryTable } from './PlayerInventoryTable';

export const ChipContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing['1']};
`;

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

  return (
    <div>
      <h1>{data?.name}</h1>

      <div style={{ maxWidth: '800px' }}>
        <Stats border={false} direction="horizontal">
          <Stats.Stat
            description="Member since"
            value={DateTime.fromISO(data?.createdAt).toLocaleString({
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          />
          <Stats.Stat
            description="Last seen"
            value={DateTime.fromISO(data?.updatedAt).toLocaleString({
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          />
        </Stats>
      </div>
      <ChipContainer>
        {data?.id && <Chip color="secondary" avatar={<TakaroIcon />} label={`Takaro ID: ${data.id}`} />}
        {data?.steamId && (
          <Chip
            color="secondary"
            avatar={<SteamIcon />}
            onClick={() => {
              window.open(`https://steamcommunity.com/profiles/${data?.steamId}`, '_blank');
            }}
            label={`Steam ID: ${data.steamId}`}
          />
        )}
        {data.epicOnlineServicesId && (
          <Chip color="secondary" avatar={<EpicGamesIcon />} onClick={() => {}} label={data.epicOnlineServicesId} />
        )}
        {data.xboxLiveId && <Chip color="secondary" avatar={<XboxIcon />} onClick={() => {}} label={data.xboxLiveId} />}
      </ChipContainer>
      <Divider />

      <h2>Roles</h2>
      <PlayerRolesTable roles={data?.roleAssignments} playerId={playerId} playerName={data?.name} />

      <h2>Inventory</h2>
      <PlayerInventoryTable playerId={data.id} />

      <Outlet />
    </div>
  );
};
