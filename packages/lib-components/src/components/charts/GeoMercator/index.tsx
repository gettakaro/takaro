import { ParentSize } from '@visx/responsive';
import { Graticule, Mercator } from '@visx/geo';
import { useTheme } from '../../../hooks';
import * as topojson from 'topojson-client';
import topology from './world.json';
import { scaleQuantize } from '@visx/vendor/d3-scale';

import { InnerChartProps, Margin } from '../util';

interface FeatureShape {
  type: 'Feature';
  id: string;
  geometry: { coordinates: [number, number][][]; type: 'Polygon' };
  properties: { name: string };
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const world = topojson.feature(topology, topology.objects.units) as {
  type: 'FeatureCollection';
  features: FeatureShape[];
};

export interface GeoMercatorProps<T> {
  name: string;
  data: T[];
  margin?: Margin;
  xAccessor: (d: T) => string; // country: string
  yAccessor: (d: T) => number; // amount: number
  tooltipAccessor: (d: T) => string;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const GeoMercator = <T,>({
  data,
  yAccessor,
  tooltipAccessor,
  xAccessor,
  name,
  margin = defaultMargin,
}: GeoMercatorProps<T>) => {
  return (
    <>
      <ParentSize>
        {(parent) => (
          <Chart<T>
            name={name}
            data={data}
            width={parent.width}
            height={parent.height}
            margin={margin}
            yAccessor={yAccessor}
            xAccessor={xAccessor}
            tooltipAccessor={tooltipAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerGeoMercator<T> = InnerChartProps & GeoMercatorProps<T>;

const Chart = <T,>({
  width,
  // yAccessor,
  // data,
  // name,
  height,
}: // margin = defaultMargin,
// tooltipAccessor
InnerGeoMercator<T>) => {
  const theme = useTheme();
  const color = scaleQuantize<string>([
    '#ffb01d',
    '#ffa020',
    '#ff9221',
    '#ff8424',
    '#ff7425',
    '#fc5e2f',
    '#f94b3a',
    '#f63a48',
  ]);
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} fill={theme.colors.background} rx={14} />
      <Mercator<FeatureShape> data={world.features} scale={scale} translate={[centerX, centerY + 50]}>
        {(mercator) => (
          <g>
            <Graticule graticule={(g) => mercator.path(g) || ''} stroke="rgba(33,33,33,0.05)" />
            {mercator.features.map(({ feature, path }, i) => (
              <path
                key={`map-feature-${i}`}
                d={path || ''}
                fill={color(feature.geometry.coordinates.length)}
                stroke={theme.colors.background}
                strokeWidth={0.5}
              />
            ))}
          </g>
        )}
      </Mercator>
    </svg>
  );
};
