import { useQuery } from '@tanstack/react-query';
import { variablesQueryOptions } from '../../../../../queries/variable';
import { FC } from 'react';
import { LayerGroup, Marker, Tooltip } from 'react-leaflet';
import { divIcon } from 'leaflet';

// TODO: We should also filter by the moduleId (variablesQueryOptions), but it's not that easy to get that here
// brain dump: There should be some way to get the currently installed teleport module
// and to get some data from that module to decide here what the variable data looks like etc.

interface Location {
  x: number;
  y: number;
  z: number;
}

interface TeleportLayerProps {
  gameServerId: string;
}

export const TeleportLayer: FC<TeleportLayerProps> = ({ gameServerId }) => {
  const { data } = useQuery(
    variablesQueryOptions({
      filters: {
        gameServerId: [gameServerId],
      },
      search: {
        key: ['waypoint'],
      },
    }),
  );

  if (!data || data.data.length === 0) {
    return;
  }

  const waypoints = data.data.map((waypoint) => {
    return {
      name: waypoint.key.replace('waypoint ', ''),
      location: JSON.parse(waypoint.value) as Location,
    };
  });

  return (
    <LayerGroup>
      {waypoints.map((waypoint) => (
        <WayPoint
          key={waypoint.name}
          name={waypoint.name}
          latitude={waypoint.location.x}
          longitude={waypoint.location.z}
        />
      ))}
    </LayerGroup>
  );
};

interface WayPointProps {
  name: string;
  latitude: number;
  longitude: number;
}

const WayPoint = ({ name, latitude, longitude }: WayPointProps) => {
  const icon = divIcon({
    html: `<svg  xmlns="http://www.w3.org/2000/svg" strokeOpacity="0" width="32"  height="32"  viewBox="0 0 24 24" fill="orange">
      <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" /></svg>`,

    iconSize: [32, 32],
  });

  return (
    <Marker icon={icon} position={[latitude, longitude]}>
      <Tooltip>{name}</Tooltip>
    </Marker>
  );
};
