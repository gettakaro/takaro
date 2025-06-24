import * as topojson from 'topojson-client';
import topology from './world.json';
import { Graticule, Mercator } from '@visx/geo';
import { scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';

import { getDefaultTooltipStyles, InnerChartProps, Margin } from '../util';
import { useTheme } from '../../../hooks';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { styled } from '../../../styled';
import { Zoom } from '@visx/zoom';
import { useCallback } from 'react';
import { localPoint } from '@visx/event';
import { ZoomControls } from '../ZoomControls';
import { alpha2ToAlpha3 } from './iso3166-alpha2-to-alpha3';

const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) {
    return '';
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};

const alpha3ToAlpha2: Record<string, string> = Object.entries(alpha2ToAlpha3).reduce(
  (acc, [alpha2, alpha3]) => {
    acc[alpha3] = alpha2;
    return acc;
  },
  {} as Record<string, string>,
);

const SidebarContainer = styled.div`
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['3']};
  margin-left: ${({ theme }) => theme.spacing['4']};
`;

const SidebarTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing['3']} 0;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CountryTable = styled.div`
  display: table;
  width: 100%;
  font-size: ${({ theme }) => theme.fontSize.small};
  border-collapse: collapse;
`;

const CountryRow = styled.div`
  display: table-row;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAccent};
  }

  &:last-child > div {
    border-bottom: none;
  }
`;

const CountryCell = styled.div`
  display: table-cell;
  padding: 2px 0;
  vertical-align: middle;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const FlagCell = styled(CountryCell)`
  width: 20px;
  text-align: center;
  font-size: 12px;
  padding-right: ${({ theme }) => theme.spacing['1']};
`;

const CountryCell2 = styled(CountryCell)`
  padding-right: ${({ theme }) => theme.spacing['1']};
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const CountCell = styled(CountryCell)`
  text-align: right;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  width: 30px;
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  position: relative;
  height: 100%;
  width: 100%;
`;

const MapContainer = styled.div`
  flex: 1;
  position: relative;
`;

const StyledTooltip = styled(Tooltip)`
  text-align: center;
  transform: translate(-50%);
`;

interface CountrySidebarProps<T> {
  data: T[];
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
}

const CountrySidebar = <T,>({ data, xAccessor, yAccessor }: CountrySidebarProps<T>) => {
  const sortedData = [...data].sort((a, b) => yAccessor(b) - yAccessor(a));

  return (
    <SidebarContainer>
      <SidebarTitle>Countries ({sortedData.length})</SidebarTitle>
      <CountryTable>
        {sortedData.map((item, index) => {
          const countryCode = xAccessor(item);
          const playerCount = yAccessor(item);
          const alpha2Code = countryCode.length === 3 ? alpha3ToAlpha2[countryCode] : countryCode;
          const flag = getCountryFlag(alpha2Code);
          // Prefer 2-letter country codes for display if available
          const displayCode = alpha2Code || countryCode;

          return (
            <CountryRow key={`${countryCode}-${index}`}>
              <FlagCell>{flag}</FlagCell>
              <CountryCell2>{displayCode}</CountryCell2>
              <CountCell>{playerCount}</CountCell>
            </CountryRow>
          );
        })}
      </CountryTable>
    </SidebarContainer>
  );
};

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
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  tooltipAccessor?: (d: T) => string;
  showZoomControls?: boolean;
  allowZoomAndDrag?: boolean;
  showCountrySidebar?: boolean;
}

type InnerGeoMercator<T> = InnerChartProps & GeoMercatorProps<T>;
const defaultMargin = { top: 0, right: 0, bottom: 0, left: 0 };
export const GeoMercator = <T,>({
  data,
  yAccessor,
  xAccessor,
  name,
  margin = defaultMargin,
  tooltipAccessor,
  showZoomControls = false,
  allowZoomAndDrag = false,
  showCountrySidebar = false,
}: GeoMercatorProps<T>) => {
  return (
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
          allowZoomAndDrag={allowZoomAndDrag}
          showZoomControls={showZoomControls}
          tooltipAccessor={tooltipAccessor}
          showCountrySidebar={showCountrySidebar}
        />
      )}
    </ParentSize>
  );
};

const Chart = <T,>({
  width,
  height,
  yAccessor,
  xAccessor,
  data,
  tooltipAccessor,
  name,
  allowZoomAndDrag,
  showZoomControls,
  showCountrySidebar,
}: InnerGeoMercator<T>) => {
  const theme = useTheme();
  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<T>();

  // Calculate sidebar width including margin
  const sidebarTotalWidth = showCountrySidebar ? 320 + parseInt(theme.spacing['4']) : 0;

  // Adjust map width to account for sidebar
  const mapWidth = width - sidebarTotalWidth;

  const centerX = mapWidth / 2;
  const centerY = height / 2;
  const scale = Math.min(mapWidth, height) * 0.25;

  const colorScale = scaleLinear({
    domain: [0, Math.max(...data.map((d) => yAccessor(d)))],
    range: [theme.colors.backgroundAlt, theme.colors.primary],
  });

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGPathElement> | React.MouseEvent<SVGPathElement>, countryData: T | undefined) => {
      const eventSvgCoords = localPoint(event);

      showTooltip({
        tooltipData: countryData,
        tooltipLeft: eventSvgCoords?.x,
        tooltipTop: eventSvgCoords ? eventSvgCoords.y - 38 : undefined,
      });
    },
    [showTooltip],
  );

  const renderMap = (zoom?: {
    containerRef: React.RefObject<SVGSVGElement>;
    isDragging: boolean;
    dragStart: any;
    dragMove: any;
    dragEnd: any;
    transformMatrix: { scaleX: number; translateX: number; translateY: number };
  }) => (
    <svg
      id={name}
      name={name}
      width={mapWidth}
      height={height}
      ref={zoom?.containerRef}
      style={{
        touchAction: 'none',
        cursor: allowZoomAndDrag && zoom ? (zoom.isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      <rect x={0} y={0} width={mapWidth} height={height} fill={theme.colors.background} rx={10} />
      <Mercator<FeatureShape>
        data={world.features}
        scale={zoom?.transformMatrix.scaleX || scale}
        translate={[zoom?.transformMatrix.translateX || centerX, zoom?.transformMatrix.translateY || centerY]}
      >
        {(mercator) => (
          <g>
            <Graticule graticule={(g) => mercator.path(g) || ''} stroke="rgba(33,33,33,0.05)" />
            {mercator.features.map(({ feature, path }, i) => {
              const countryData = data.find((d) => {
                // If alpha2 , try to convert it to aplha3.
                // Since world.json only has support for alpha3.
                if (xAccessor(d).length === 2) {
                  return alpha2ToAlpha3[xAccessor(d)] === feature.id;
                }
                return xAccessor(d) === feature.id;
              });

              const fillColor = countryData ? colorScale(yAccessor(countryData)) : theme.colors.backgroundAlt;

              return (
                <path
                  key={`map-feature-${i}`}
                  d={path || ''}
                  stroke={theme.colors.backgroundAccent}
                  strokeWidth={0.35}
                  fill={fillColor}
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
      {allowZoomAndDrag && zoom && (
        <rect
          x={0}
          y={0}
          width={mapWidth}
          height={height}
          rx={14}
          fill="transparent"
          onTouchStart={zoom.dragStart}
          onTouchMove={zoom.dragMove}
          onTouchEnd={zoom.dragEnd}
          onMouseDown={zoom.dragStart}
          onMouseMove={zoom.dragMove}
          onMouseUp={zoom.dragEnd}
          onMouseLeave={() => {
            if (zoom.isDragging) zoom.dragEnd();
          }}
        />
      )}
    </svg>
  );

  const renderContent = (zoomProps?: any) => (
    <FlexContainer>
      <MapContainer>
        {renderMap(zoomProps)}
        {showZoomControls && zoomProps && <ZoomControls zoom={zoomProps} />}
        {tooltipData && (
          <StyledTooltip top={tooltipTop} left={tooltipLeft} style={getDefaultTooltipStyles(theme)}>
            {tooltipAccessor ? tooltipAccessor(tooltipData) : `${xAccessor(tooltipData)}: ${yAccessor(tooltipData)}`}
          </StyledTooltip>
        )}
      </MapContainer>
      {showCountrySidebar && <CountrySidebar data={data} xAccessor={xAccessor} yAccessor={yAccessor} />}
    </FlexContainer>
  );

  return allowZoomAndDrag ? (
    <Zoom<SVGSVGElement>
      width={mapWidth}
      height={height}
      scaleXMin={100}
      scaleXMax={1000}
      scaleYMin={100}
      scaleYMax={1000}
      initialTransformMatrix={{
        scaleX: scale,
        scaleY: scale,
        translateX: centerX,
        translateY: centerY,
        skewX: 0,
        skewY: 0,
      }}
    >
      {(zoom) => renderContent(zoom)}
    </Zoom>
  ) : (
    renderContent()
  );
};
