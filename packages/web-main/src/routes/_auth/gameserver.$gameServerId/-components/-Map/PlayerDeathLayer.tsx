// TODO: for now we make a playerDeathLayer (but only the last 15 deaths)

import { divIcon } from 'leaflet';
import { eventsQueryOptions } from '../../../../../queries/event';
import { FC } from 'react';
import { LayerGroup, Marker, Tooltip } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { EventPlayerDeath } from '@takaro/apiclient';
import { DateTime } from 'luxon';

interface PlayerDeathLayerProps {
  gameServerId: string;
}

// TODO: we need to subscribe to the player-death events to immediately show the new ones additionally

// where the color of the Marker is the color of the player (if he was online)
export const PlayerDeathLayer: FC<PlayerDeathLayerProps> = ({ gameServerId }) => {
  const { data } = useQuery({
    ...eventsQueryOptions({ filters: { eventName: ['player-death'], gameserverId: [gameServerId] }, limit: 20 }),
    refetchInterval: 60000,
  });

  const playerDeathEvents = data?.data;

  if (!playerDeathEvents || playerDeathEvents.length === 0) {
    return <LayerGroup></LayerGroup>;
  }

  console.log('playerDeathEvents', playerDeathEvents);

  return (
    <LayerGroup>
      {playerDeathEvents.map((e) => {
        return (
          <PlayerDeath
            latitude={(e.meta as EventPlayerDeath).position!.x}
            longitude={(e.meta as EventPlayerDeath).position!.z}
            playerName={(e.meta as EventPlayerDeath).player.name}
            timestamp={(e.meta as EventPlayerDeath).timestamp}
            attackerName={(e.meta as EventPlayerDeath).attacker?.name}
          />
        );
      })}
    </LayerGroup>
  );
};

interface PlayerDeathProps {
  latitude: number;
  longitude: number;
  playerName: string;
  timestamp: string;
  attackerName?: string;

  // gameServerId: string;
  //playerId: string;
}

// TODO: we could provide links to the event, to the player...
const PlayerDeath: FC<PlayerDeathProps> = ({ latitude, longitude, playerName, attackerName, timestamp }) => {
  const icon = divIcon({
    html: `<svg  xmlns="http://www.w3.org/2000/svg"  width="32"  height="32"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-skull"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 4c4.418 0 8 3.358 8 7.5c0 1.901 -.755 3.637 -2 4.96l0 2.54a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-2.54c-1.245 -1.322 -2 -3.058 -2 -4.96c0 -4.142 3.582 -7.5 8 -7.5z" /><path d="M10 17v3" /><path d="M14 17v3" /><path d="M9 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>`,
    iconSize: [32, 32],
  });

  return (
    <Marker position={[latitude, longitude]} icon={icon}>
      <Tooltip>
        <div>timestamp: {DateTime.fromISO(timestamp).toFormat('dd-MM-yyyy HH:mm:ss')}</div>
        {attackerName && <div>Killed by: {attackerName}</div>}
        {playerName}
      </Tooltip>
    </Marker>
  );
};
