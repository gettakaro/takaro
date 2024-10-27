import { MouseEvent, useCallback } from 'react';

import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Line, LineRadial } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { useTooltipInPortal, useTooltip } from '@visx/tooltip';
import { Point } from '@visx/point';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';

import { getDefaultTooltipStyles, InnerChartProps, Margin } from '../util';
import { genAngles, genPoints, genPolygonPoints } from './generators';
import { useTheme } from '../../../hooks';
import { EmptyChart } from '../EmptyChart';

export interface RadarChartProps<T> {
  name: string;
  data: T[];
  margin?: Margin;
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  tooltipAccessor: (d: T) => string;
  levels?: number;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const RadarChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  tooltipAccessor,
  name,
  levels = 5,
  margin = defaultMargin,
}: RadarChartProps<T>) => {
  if (!data || data.length === 0) return <EmptyChart />;
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
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            levels={levels}
            tooltipAccessor={tooltipAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerRadarChartProps<T> = InnerChartProps & RadarChartProps<T>;

const Chart = <T,>({
  width,
  yAccessor,
  data,
  name,
  levels = 5,
  xAccessor,
  height,
  margin = defaultMargin,
  tooltipAccessor,
}: InnerRadarChartProps<T>) => {
  const theme = useTheme();

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<string>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;

  const radialScale = scaleLinear<number>({
    domain: [360, 0],
    range: [0, Math.PI * 2],
  });
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...data.map(yAccessor))],
    range: [0, radius],
  });

  const handleMouseOver = useCallback(
    (event: MouseEvent, data: T) => {
      const target = event.target as SVGElement;
      const coords = localPoint(target.ownerSVGElement!, event);

      showTooltip({
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
        tooltipData: tooltipAccessor(data),
      });
    },
    [data, tooltipAccessor],
  );

  const webs = genAngles(data.length);
  const points = genPoints(data.length, radius);
  const polygonPoints = genPolygonPoints(data, (d) => yScale(d) ?? 0, yAccessor);
  const zeroPoint = new Point({ x: 0, y: 0 });

  return width < 10 ? null : (
    <svg ref={containerRef} width={width} height={height}>
      <rect fill={theme.colors.background} width={width} height={height} rx={14} />
      <Group top={height / 2 - margin.top} left={width / 2}>
        {[...new Array(levels)].map((_, i) => (
          <LineRadial
            key={`web-${i}`}
            data={webs}
            angle={(d) => radialScale(d.angle) ?? 0}
            radius={((i + 1) * radius) / levels}
            fill="none"
            stroke={theme.colors.backgroundAccent}
            strokeWidth={2}
            strokeOpacity={0.8}
            strokeLinecap="round"
          />
        ))}
        {[...new Array(data.length)].map((_, i) => (
          <>
            <Line key={`radar-line-${i}`} from={zeroPoint} to={points[i]} stroke={theme.colors.backgroundAccent} />
            <Text
              textAnchor="middle"
              verticalAnchor="middle"
              y={points[i].y}
              x={points[i].x}
              dy={points[i].y / 12}
              dx={points[i].x / 12}
              fill={theme.colors.text}
            >
              {xAccessor(data[i])}
            </Text>
          </>
        ))}
        <polygon
          points={polygonPoints.pointString}
          fill={theme.colors.primary}
          fillOpacity={0.3}
          stroke={theme.colors.primary}
          strokeWidth={2}
        />
        {polygonPoints.points.map((point, i) => (
          <circle
            key={`radar-point-${i}`}
            cx={point.x}
            cy={point.y}
            onMouseOut={hideTooltip}
            onMouseOver={(e) => handleMouseOver(e, data[i])}
            r={5}
            style={{ cursor: 'pointer' }}
            fill={theme.colors.primary}
          />
        ))}
      </Group>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={`tooltip-${name}`}
          top={tooltipTop}
          left={tooltipLeft}
          style={getDefaultTooltipStyles(theme)}
        >
          {tooltipData}
        </TooltipInPortal>
      )}
    </svg>
  );
};
