import { createFileRoute } from '@tanstack/react-router';
import { styled, useLocalStorage } from '@takaro/lib-components';
import { LayersControl, MapContainer } from 'react-leaflet';
import L, { Point, LatLng, Transformation, LeafletEvent } from 'leaflet';
import { gameServerMapInfoOptions } from '../../../queries/gameserver';
import { useQuery } from '@tanstack/react-query';
import { getConfigVar } from '../../../util/getConfigVar';
import { SDTDTileLayer } from './-components/-Map/TileLayer';
import 'leaflet/dist/leaflet.css';
import { PlayerLayer } from './-components/-Map/PlayerLayer';
import { TeleportLayer } from './-components/-Map/TeleportLayer';
import { PlayerDeathLayer } from './-components/-Map/PlayerDeathLayer';

interface MapState {
  zoom: number;
  center: {
    lat: number;
    lng: number;
  };
  layers: {
    players: boolean;
    playerDeaths: boolean;
    teleports: boolean;
  };
}

const defaultMapState: MapState = {
  zoom: 1,
  center: {
    lat: 0,
    lng: 0,
  },
  layers: {
    players: true,
    teleports: true,
    playerDeaths: true,
  },
};

const Container = styled.div`
  width: 800px;
  height: 800px;
  position: relative;
  overflow: hidden;
  background-color: pink;
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/map')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const [mapInfo] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerMapInfoOptions(params.gameServerId)),
    ]);

    return {
      mapInfo,
    };
  },
});

function RouteComponent() {
  let { gameServerId } = Route.useParams();
  let loaderData = Route.useLoaderData();
  const { setValue: setMapState, storedValue: mapState } = useLocalStorage<MapState>(
    `map-state-${gameServerId}`,
    defaultMapState,
  );

  const MAP_TILE_URL = getConfigVar('apiUrl') + `/gameserver/${gameServerId}/map/tile/{z}/{x}/{y}`;

  const { data: mapInfo } = useQuery({ ...gameServerMapInfoOptions(gameServerId), initialData: loaderData.mapInfo });

  const SDTD_Projection = {
    project: (latlng: LatLng) => {
      return new Point(latlng.lat / Math.pow(2, mapInfo.maxZoom), latlng.lng / Math.pow(2, mapInfo.maxZoom));
    },

    unproject: (point: Point) => {
      return new LatLng(point.x * Math.pow(2, mapInfo.maxZoom), point.y * Math.pow(2, mapInfo.maxZoom));
    },
  };

  const SDTD_CRS = L.extend({}, L.CRS.Simple, {
    projection: SDTD_Projection,
    transformation: new Transformation(1, 0, -1, 0),

    scale: function (zoom: number) {
      return Math.pow(2, zoom);
    },
  });

  if (!loaderData.mapInfo.enabled) {
    return <div>Map is not enabled</div>;
  }

  return (
    <Container>
      <MapContainer
        style={{ width: '100%', height: '100%', border: '1px solid orange' }}
        center={{ lat: mapState.center.lat, lng: mapState.center.lng }}
        zoom={mapState.zoom}
        zoomControl={true}
        minZoom={1}
        scrollWheelZoom={true}
        attributionControl={false}
        crs={SDTD_CRS}
        maxBounds={[
          [-mapInfo.mapSizeX / 2, -mapInfo.mapSizeZ / 2],
          [mapInfo.mapSizeX / 2, mapInfo.mapSizeZ / 2],
        ]}
        // @ts-expect-error: something
        whenReady={(e: LeafletEvent) => {
          const { target } = e;
          target.on('overlayadd', (e: any) => {
            if (e.name) {
              setMapState((mapState) => ({
                ...mapState,
                layers: { ...mapState.layers, [e.name.toLowerCase()]: true },
              }));
            }
          });

          target.on('overlayremove', (e: any) => {
            if (e.name) {
              setMapState((mapState) => ({
                ...mapState,
                layers: { ...mapState.layers, [e.name.toLowerCase()]: false },
              }));
            }
          });
        }}
        maxBoundsViscosity={1.0}
      >
        <LayersControl collapsed={false} position="topright">
          <SDTDTileLayer url={MAP_TILE_URL} mapInfo={mapInfo} />

          <LayersControl.Overlay name="Players" checked={mapState.layers.players}>
            <PlayerLayer gameServerId={gameServerId} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Player Deaths" checked={mapState.layers.playerDeaths}>
            <PlayerDeathLayer gameServerId={gameServerId} />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Teleports" checked={mapState.layers.teleports}>
            <TeleportLayer gameServerId={gameServerId} />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </Container>
  );
}
