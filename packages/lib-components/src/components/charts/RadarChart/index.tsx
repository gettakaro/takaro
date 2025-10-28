import { MouseEvent, useCallback } from 'react';

import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LineRadial } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { useTooltipInPortal, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { motion } from 'framer-motion';

import { getDefaultTooltipStyles, InnerChartProps, TooltipConfig, ChartProps } from '../util';
import { genAngles, genPoints, genPolygonPoints } from './generators';
import { useTheme } from '../../../hooks';

export interface RadarChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  levels?: number;
  /** Tooltip configuration */
  tooltip?: TooltipConfig<T>;
}

const defaultMargin = { top: 40, right: 40, bottom: 40, left: 40 };
export const RadarChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  name,
  levels = 5,
  margin = defaultMargin,
  animate = true,
  tooltip,
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
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            levels={levels}
            tooltip={tooltip}
            animate={animate}
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
  tooltip,
  animate = true,
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

  // Scale dot size based on chart size (5px for ~400px charts, minimum 3px, maximum 8px)
  const dotRadius = Math.max(3, Math.min(8, radius / 40));

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
        tooltipData: tooltip?.accessor && tooltip.accessor(data),
      });
    },
    [data, tooltip?.accessor],
  );

  const webs = genAngles(data.length);
  const points = genPoints(data.length, radius);
  const polygonPoints = genPolygonPoints(data, (d) => yScale(d) ?? 0, yAccessor);

  return width < 10 ? null : (
    <svg ref={containerRef} width={width} height={height}>
      <rect fill={theme.colors.background} width={width} height={height} rx={14} />
      <Group top={height / 2} left={width / 2}>
        {[...new Array(levels)].map((_, i) => (
          <LineRadial
            key={`web-${i}`}
            data={webs}
            angle={(d) => radialScale(d.angle) ?? 0}
            radius={((i + 1) * radius) / levels}
          >
            {({ path }) => {
              const d = path(webs) || '';
              return (
                <motion.path
                  d={d}
                  fill="none"
                  stroke={theme.colors.backgroundAccent}
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  strokeLinecap="round"
                  initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 0.8 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={
                    animate
                      ? {
                          duration: 0.6,
                          delay: i * 0.1,
                          ease: 'easeOut',
                        }
                      : { duration: 0 }
                  }
                />
              );
            }}
          </LineRadial>
        ))}
        {[...new Array(data.length)].map((_, i) => (
          <>
            <motion.line
              key={`radar-line-${i}`}
              x1={0}
              y1={0}
              stroke={theme.colors.backgroundAccent}
              initial={animate ? { x2: 0, y2: 0 } : { x2: points[i].x, y2: points[i].y }}
              animate={{ x2: points[i].x, y2: points[i].y }}
              transition={
                animate
                  ? {
                      duration: 0.5,
                      delay: i * 0.05,
                      ease: 'easeOut',
                    }
                  : { duration: 0 }
              }
            />
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
          fillOpacity={0.5}
          stroke={theme.colors.primary}
          strokeWidth={2}
        />
        {polygonPoints.points.map((point, i) => (
          <g key={`radar-point-${i}`}>
            {/* Visible dot */}
            <circle cx={point.x} cy={point.y} r={dotRadius} fill={theme.colors.primary} />
            {/* Invisible larger hit area for tooltip */}
            <circle
              cx={point.x}
              cy={point.y}
              r={dotRadius * 3}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseOut={hideTooltip}
              onMouseOver={(e) => handleMouseOver(e, data[i])}
            />
          </g>
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
