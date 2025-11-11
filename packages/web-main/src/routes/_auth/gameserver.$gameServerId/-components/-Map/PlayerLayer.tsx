import { useQuery } from '@tanstack/react-query';
import { divIcon, Marker as LeafletMarker } from 'leaflet';
import { playersOnGameServersQueryOptions } from '../../../../../queries/pog';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { LayerGroup, Marker, Tooltip } from 'react-leaflet';

interface PlayerLayerProps {
  gameServerId: string;
}

// brain dump: I suppose we will need to pass a websocket subscriber here
// that specifically listens to player position updates of this specific gameserver.
export const PlayerLayer: FC<PlayerLayerProps> = ({ gameServerId }) => {
  const { data } = useQuery({
    ...playersOnGameServersQueryOptions({
      filters: { gameServerId: [gameServerId], online: [true] },
      extend: ['player'],
    }),
    refetchInterval: 30000, // position is currently updated every 30 seconds.
  });

  if (!data) {
    return;
  }

  // remove players that don't have a position?
  const pogs = data.data.filter((pog) => pog.positionX !== undefined && pog.positionZ !== undefined);

  return (
    <LayerGroup>
      {pogs.map((pog) => (
        <Player
          playerName={pog['player'].name}
          latitude={pog.positionX as number}
          longitude={pog.positionZ as number}
          gameServerId={gameServerId}
          playerId={pog.playerId}
        />
      ))}
    </LayerGroup>
  );
};

interface PlayerProps {
  latitude: number;
  longitude: number;
  gameServerId: string;
  playerId: string;
  playerName: string;
}

export const Player: FC<PlayerProps> = ({ latitude, longitude, playerName }) => {
  const [draggable, setDraggable] = useState<boolean>(true);
  const markerRef = useRef<LeafletMarker>(null);
  const icon = divIcon({
    html: `<svg  xmlns="http://www.w3.org/2000/svg"  width="32"  height="32"  viewBox="0 0 24 24"  fill="red"  class="icon icon-tabler icons-tabler-filled icon-tabler-navigation"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.092 2.581a1 1 0 0 1 1.754 -.116l.062 .116l8.005 17.365c.198 .566 .05 1.196 -.378 1.615a1.53 1.53 0 0 1 -1.459 .393l-7.077 -2.398l-6.899 2.338a1.535 1.535 0 0 1 -1.52 -.231l-.112 -.1c-.398 -.386 -.556 -.954 -.393 -1.556l.047 -.15l7.97 -17.276z" /></svg>`,
    iconSize: [32, 32],
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
        }
      },
    }),
    [],
  );
  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d);
  }, []);

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={[latitude, longitude]}
      alt={`marker for player ${playerName}`}
      icon={icon}
      ref={markerRef}
    >
      <Tooltip>{playerName}</Tooltip>
    </Marker>
  );
};
