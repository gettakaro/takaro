import { MouseEvent, useCallback } from 'react';

import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LineRadial } from '@visx/shape';
import { scaleTime, scaleLog, NumberLike } from '@visx/scale';
import { GridAngle, GridRadial } from '@visx/grid';
import { AxisLeft } from '@visx/axis';
import { motion } from 'framer-motion';
import { extent } from '@visx/vendor/d3-array';
import { curveBasisOpen } from '@visx/curve';
import { useTooltipInPortal, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import { InnerChartProps, getDefaultTooltipStyles, TooltipConfig, ChartProps } from '../util';
import { useTheme } from '../../../hooks';
import { useGradients } from '../useGradients';
import { EmptyChart } from '../EmptyChart';

const formatTicks = (val: NumberLike) => String(val);

export interface RadialLineChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => number;
  yAccessor: (d: T) => number;
  /** Tooltip configuration */
  tooltip?: TooltipConfig<T>;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const RadialLineChart = <T,>({
  data,
  yAccessor,
  xAccessor,
  name,
  margin = defaultMargin,
  animate = true,
  tooltip,
}: RadialLineChartProps<T>) => {
  const hasData = data && data.length > 0;

  return (
    <>
      <ParentSize>
        {hasData
          ? (parent) => (
              <Chart<T>
                name={name}
                data={data}
                width={parent.width}
                height={parent.height}
                margin={margin}
                yAccessor={yAccessor}
                xAccessor={xAccessor}
                tooltip={tooltip}
                animate={animate}
              />
            )
          : () => <EmptyChart />}
      </ParentSize>
    </>
  );
};

type InnerRadialLineChartProps<T> = InnerChartProps & RadialLineChartProps<T>;

const Chart = <T,>({
  width,
  xAccessor,
  yAccessor,
  data,
  name,
  height,
  tooltip,
  animate = true,
}: InnerRadialLineChartProps<T>) => {
  const tooltipAccessor = tooltip?.accessor;
  const theme = useTheme();
  const gradients = useGradients(name);

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<T>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const xScale = scaleTime<number>({
    range: [0, Math.PI * 2],
    domain: extent(data, xAccessor) as [number, number],
  });

  const yScale = scaleLog<number>({
    domain: extent(data, yAccessor) as [number, number],
  });

  const angle = (d: T) => xScale(xAccessor(d)) ?? 0;
  const radius = (d: T) => yScale(yAccessor(d)) ?? 0;
  const padding = 15;

  const handleMouseOver = useCallback(
    (event: MouseEvent, dataPoint: T) => {
      if (!tooltipAccessor) return;

      const target = event.target as SVGElement;
      const coords = localPoint(target.ownerSVGElement!, event);

      showTooltip({
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
        tooltipData: dataPoint,
      });
    },
    [tooltipAccessor, showTooltip],
  );

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  const reverseYScale = yScale.copy().range(yScale.range().reverse());

  return width < 10 ? null : (
    <svg ref={containerRef} width={width} height={height}>
      {gradients.chart.gradient}
      <rect width={width} height={height} fill={theme.colors.background} rx={14} />
      <Group top={height / 2} left={width / 2}>
        <GridAngle
          scale={xScale}
          outerRadius={height / 2 - padding}
          stroke={theme.colors.backgroundAccent}
          strokeWidth={1}
          strokeOpacity={0.3}
          strokeDasharray="5,2"
          numTicks={20}
        />
        <GridRadial
          scale={yScale}
          numTicks={5}
          stroke={theme.colors.backgroundAccent}
          strokeWidth={1}
          fill={theme.colors.backgroundAccent}
          fillOpacity={0.1}
          strokeOpacity={0.2}
        />
        <AxisLeft
          top={-height / 2 + padding}
          scale={reverseYScale}
          numTicks={5}
          tickStroke="none"
          tickLabelProps={{
            fontSize: 8,
            fill: theme.colors.text,
            fillOpacity: 1,
            textAnchor: 'middle',
            dx: '1em',
            dy: '-0.5em',
            paintOrder: 'stroke',
          }}
          tickFormat={formatTicks}
          hideAxisLine
        />
        <LineRadial<T> angle={angle} radius={radius} curve={curveBasisOpen}>
          {({ path }) => {
            const d = path(data) || '';
            return (
              <motion.path
                d={d}
                strokeWidth={3}
                strokeOpacity={0.8}
                strokeLinecap="round"
                fill="none"
                stroke={theme.colors.primary}
                initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
                animate={{ pathLength: 1 }}
                transition={
                  animate
                    ? {
                        duration: 1.5,
                        ease: 'easeInOut',
                      }
                    : { duration: 0 }
                }
              />
            );
          }}
        </LineRadial>
        {tooltipAccessor &&
          data.map((d, i) => {
            const angleVal = angle(d);
            const radiusVal = radius(d);
            const x = Math.cos(angleVal - Math.PI / 2) * radiusVal;
            const y = Math.sin(angleVal - Math.PI / 2) * radiusVal;

            return (
              <g key={`data-point-${i}`}>
                {/* Invisible hit area for tooltip - no need for visible dots */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseOut={hideTooltip}
                  onMouseOver={(e) => handleMouseOver(e, d)}
                  initial={animate ? { scale: 0 } : { scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={
                    animate
                      ? {
                          duration: 0.3,
                          delay: 1.5,
                          ease: 'easeOut',
                        }
                      : { duration: 0 }
                  }
                />
              </g>
            );
          })}
      </Group>
      {tooltipOpen && tooltipData && tooltipAccessor && (
        <TooltipInPortal
          key={`tooltip-${name}`}
          top={tooltipTop}
          left={tooltipLeft}
          style={getDefaultTooltipStyles(theme)}
        >
          {tooltipAccessor(tooltipData)}
        </TooltipInPortal>
      )}
    </svg>
  );
};
