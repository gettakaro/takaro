import * as topojson from 'topojson-client';
import topology from './world.json';
import { Graticule, Mercator } from '@visx/geo';
import { ParentSize } from '@visx/responsive';

import { getDefaultTooltipStyles, InnerChartProps, Margin } from '../util';
import { useTheme } from '../../../hooks';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { useCallback } from 'react';
import { localPoint } from '@visx/event';
import { shade } from 'polished';

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
  yAccessor: (d: T) => number; // amount: number (used for color)
  tooltipAccessor?: (d: T) => string;
}

const defaultMargin = { top: 0, right: 0, bottom: 0, left: 0 };
export const GeoMercator = <T,>({
  data,
  yAccessor,
  xAccessor,
  name,
  margin = defaultMargin,
  tooltipAccessor,
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
  yAccessor,
  xAccessor,
  data,
  tooltipAccessor,
  name,
  height,
}: // margin = defaultMargin,
// tooltipAccessor
InnerGeoMercator<T>) => {
  const theme = useTheme();
  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<T>();

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGPathElement> | React.MouseEvent<SVGPathElement>, countryData: T | undefined) => {
      const eventSvgCoords = localPoint(event);

      showTooltip({
        tooltipData: countryData,
        tooltipLeft: eventSvgCoords?.x,
        tooltipTop: eventSvgCoords?.y,
      });
    },
    [yAccessor, xAccessor, width, height],
  );

  return width < 10 ? null : (
    <>
      <svg id={name} name={name} width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={theme.colors.background} rx={14} />
        <Mercator<FeatureShape> data={world.features} scale={scale} translate={[centerX, centerY + 50]}>
          {(mercator) => (
            <g>
              <Graticule graticule={(g) => mercator.path(g) || ''} stroke="rgba(33,33,33,0.05)" />
              {mercator.features.map(({ feature, path }, i) => {
                const countryData = data.find((d) => xAccessor(d) === feature.id);
                return (
                  <path
                    key={`map-feature-${i}`}
                    d={path || ''}
                    stroke={countryData ? theme.colors.primary : theme.colors.backgroundAccent}
                    strokeWidth={countryData ? 1 : 0.5}
                    fill={countryData ? shade(0.5, theme.colors.primary) : theme.colors.backgroundAlt}
                    onMouseLeave={hideTooltip}
                    onMouseMove={(e) => handleTooltip(e, countryData)}
                    onTouchStart={(e) => handleTooltip(e, countryData)}
                    onTouchMove={(e) => handleTooltip(e, countryData)}
                  />
                );
              })}
            </g>
          )}
        </Mercator>
      </svg>
      {tooltipData && (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...getDefaultTooltipStyles(theme),
            textAlign: 'center',
            transform: 'translate(-50%)',
          }}
        >
          {tooltipAccessor ? tooltipAccessor(tooltipData) : `${xAccessor(tooltipData)}: ${yAccessor(tooltipData)}`}
        </Tooltip>
      )}
    </>
  );
};
