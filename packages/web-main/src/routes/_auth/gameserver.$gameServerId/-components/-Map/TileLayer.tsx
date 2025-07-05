import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { FC, useEffect } from 'react';
import { MapInfoDTO } from '@takaro/apiclient';

interface SDTDTileLayerProps {
  mapInfo: MapInfoDTO;
  url: string;
}

export const SDTDTileLayer: FC<SDTDTileLayerProps> = ({ mapInfo, url }) => {
  const map = useMap();

  const tileLayer = L.tileLayer(url, {
    maxZoom: mapInfo.maxZoom + 1,
    minZoom: Math.max(0, mapInfo.maxZoom - 5),
    maxNativeZoom: mapInfo.maxZoom,
    minNativeZoom: 0,
    tileSize: mapInfo.mapBlockSize,
  });

  tileLayer.getTileUrl = function (coords) {
    coords.y = -coords.y - 1;
    return L.TileLayer.prototype.getTileUrl.bind(tileLayer)(coords);
  };

  useEffect(() => {
    return () => {
      tileLayer.remove();
    };
  }, []);

  tileLayer.addTo(map);
  return null;
};
