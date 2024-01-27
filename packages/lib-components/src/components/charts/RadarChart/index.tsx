import { MouseEvent } from 'react';

import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Line, LineRadial } from '@visx/shape';
import { scaleLinear } from '@visx/vendor/d3-scale';
import { useTooltipInPortal, useTooltip } from '@visx/tooltip';
import { Point } from '@visx/point';
import { localPoint } from '@visx/event';

import { getDefaultTooltipStyles, InnerChartProps, Margin } from '../util';
import { genAngles, genPoints, genPolygonPoints } from './generators';
import { useTheme } from '../../../hooks';

export interface RadarChartProps<T> {
  name: string;
  data: T[];
  margin?: Margin;
  yAccessor: (d: T) => number;
  tooltipAccessor: (d: T) => string;
  levels?: number;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const RadarChart = <T,>({
  data,
  yAccessor,
  tooltipAccessor,
  name,
  levels = 5,
  margin = defaultMargin,
}: RadarChartProps<T>) => {
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

  const radialScale = scaleLinear<number>([360, 0], [0, Math.PI * 2]);
  const yScale = scaleLinear<number>([0, Math.max(...data.map(yAccessor))], [0, radius]);

  const handleMouseOver = (event: MouseEvent) => {
    const target = event.target as SVGElement;
    const coords = localPoint(target.ownerSVGElement!, event);
    const data = JSON.parse(target.dataset.tooltip!);

    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: tooltipAccessor(data),
    });
  };

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
          <Line key={`radar-line-${i}`} from={zeroPoint} to={points[i]} stroke={theme.colors.backgroundAccent} />
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
            onMouseOver={handleMouseOver}
            r={5}
            style={{ cursor: 'pointer' }}
            data-tooltip={JSON.stringify(data[i])}
            fill={theme.colors.primary}
          />
        ))}
      </Group>{' '}
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
