import { useMemo, useRef, useState, useCallback } from 'react';

import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleBand, scaleLinear } from '@visx/scale';
import { max } from '@visx/vendor/d3-array';
import { ParentSize } from '@visx/responsive';
import { Bounds } from '@visx/brush/lib/types';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Brush } from '@visx/brush';
import { PatternLines } from '@visx/pattern';
import { shade } from 'polished';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { motion } from 'framer-motion';

import { useTheme } from '../../../hooks';
import { ChartProps, InnerChartProps, BrushConfig, TooltipConfig, getDefaultTooltipStyles } from '../util';
import { BrushHandle } from '../BrushHandle';
import { EmptyChart } from '../EmptyChart';

export interface BarChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  /** Bar width as percentage (0-1). 1.0 = bars touch (no gaps), 0.5 = bars take 50% of space. Default: 0.6 */
  barWidth?: number;
  tooltip?: TooltipConfig<T>;
  brush?: BrushConfig;
}

const defaultMargin = { top: 20, left: 60, bottom: 60, right: 20 };
const defaultBrushMargin = { top: 10, bottom: 15, left: 60, right: 20 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;

export const BarChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  name,
  grid = 'none',
  axis,
  barWidth = 0.6,
  tooltip,
  brush,
  animate = true,
  margin = defaultMargin,
}: BarChartProps<T>) => {
  if (!data || data.length === 0) {
    return <EmptyChart />;
  }

  return (
    <>
      <ParentSize>
        {(parent) => (
          <Chart<T>
            name={name}
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            data={data}
            width={parent.width}
            height={parent.height}
            grid={grid}
            axis={axis}
            barWidth={barWidth}
            tooltip={tooltip}
            brush={brush}
            animate={animate}
            margin={margin}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerBarChartProps<T> = InnerChartProps & BarChartProps<T>;

const Chart = <T,>({
  data,
  xAccessor,
  yAccessor,
  width,
  height,
  margin = defaultMargin,
  grid = 'none',
  axis,
  barWidth = 0.6,
  tooltip,
  brush,
  animate = true,
  name,
}: InnerBarChartProps<T>) => {
  const showAxisX = axis?.showX ?? defaultShowAxisX;
  const showAxisY = axis?.showY ?? defaultShowAxisY;
  const axisXLabel = axis?.labelX;
  const axisYLabel = axis?.labelY;
  const numTicksY = axis?.numTicksY ?? 5;

  const tooltipAccessor = tooltip?.accessor;
  const showTooltipEnabled = tooltip?.enabled ?? true;

  const showBrush = brush?.enabled ?? false;
  const brushMargin = brush?.margin ?? defaultBrushMargin;
  const [filteredData, setFilteredData] = useState(data);

  const brushRef = useRef(null);
  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<T>();
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const axisHeight = 100;
  const theme = useTheme();

  const PATTERN_ID = `${name}-brush_pattern`;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = height - margin.top - axisHeight; // 100 for axis

  const chartSeparation = 30;
  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: filteredData.map(xAccessor),
        padding: (1 - barWidth) / barWidth,
      }),
    [xMax, filteredData, barWidth],
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, max(filteredData, yAccessor) ?? 0],
      }),
    [yMax, filteredData],
  );

  const xBrushScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xBrushMax],
        domain: data.map(xAccessor),
        round: true,
        padding: (1 - barWidth) / barWidth,
      }),
    [xBrushMax, barWidth],
  );

  const yBrushScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, Math.max(...data.map(yAccessor))],
        nice: true,
      }),
    [yBrushMax],
  );

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain || !domain.xValues) return;
    const { xValues } = domain;

    const filtered = data.filter((d) => {
      const xValue = xAccessor(d);
      return xValues.includes(xValue);
    });

    setFilteredData(filtered);
  };

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGElement> | React.MouseEvent<SVGElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      // x is relative to the SVG, subtract margin to get chart-relative position
      const xRelativeToChart = x - margin.left;

      // Find the bar that contains this x position
      const xValue = xScale.domain().find((domainValue) => {
        const barX = xScale(domainValue) ?? 0;
        const barWidth = xScale.bandwidth();
        return xRelativeToChart >= barX && xRelativeToChart <= barX + barWidth;
      });

      if (xValue) {
        const d = filteredData.find((item) => xAccessor(item) === xValue);
        if (d) {
          const tooltipX = (xScale(xValue) ?? 0) + xScale.bandwidth() / 2; // Center of bar
          const tooltipY = yScale(yAccessor(d));

          setHoveredBar(xValue);
          showTooltip({
            tooltipData: d,
            tooltipLeft: tooltipX,
            tooltipTop: tooltipY,
          });
        }
      }
    },
    [xScale, yScale, filteredData, xAccessor, yAccessor, margin.left, showTooltip],
  );

  return (
    <div>
      <svg width={width} height={height} role="img" aria-label={`Bar chart: ${name}`}>
        <desc id={`${name}-desc`}>Bar chart showing {filteredData.length} data points</desc>
        {(grid === 'y' || grid === 'xy') && (
          <GridRows
            top={margin.top}
            left={margin.left}
            scale={yScale}
            width={xMax}
            height={yMax}
            stroke={theme.colors.backgroundAccent}
            strokeOpacity={1}
            strokeDasharray="2,2"
            pointerEvents="none"
          />
        )}
        {(grid === 'x' || grid === 'xy') && (
          <GridColumns
            top={margin.top}
            left={margin.left}
            scale={xScale}
            height={yMax}
            stroke={theme.colors.backgroundAccent}
            strokeOpacity={1}
            strokeDasharray="2,2"
            pointerEvents="none"
          />
        )}
        {/* Hover highlight */}
        {hoveredBar && (
          <Group top={margin.top} left={margin.left}>
            {(() => {
              const barX = xScale(hoveredBar) ?? 0;
              const barWidth = xScale.bandwidth();
              const stepWidth = xScale.step();
              const highlightX = barX - (stepWidth - barWidth) / 2;

              return (
                <motion.rect
                  x={highlightX}
                  y={0}
                  width={stepWidth}
                  height={yMax}
                  fill={theme.colors.backgroundAccent}
                  opacity={0.15}
                  pointerEvents="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  transition={{ duration: 0.15 }}
                />
              );
            })()}
          </Group>
        )}
        <Group top={margin.top} left={margin.left}>
          {filteredData.map((d, index) => {
            const xVal = xAccessor(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(yAccessor(d)) ?? 0);
            return (
              <g key={`bar-${xVal}`} transform={`translate(${xScale(xVal)}, ${yMax})`}>
                <motion.rect
                  x={0}
                  width={barWidth}
                  fill={shade(0.5, theme.colors.primary)}
                  stroke={theme.colors.primary}
                  initial={animate ? { y: 0, height: 0 } : { y: -barHeight, height: barHeight }}
                  animate={{ y: -barHeight, height: barHeight }}
                  transition={
                    animate
                      ? {
                          duration: 0.6,
                          delay: index * 0.05,
                          ease: 'easeOut',
                        }
                      : { duration: 0 }
                  }
                />
              </g>
            );
          })}
        </Group>
        {showTooltipEnabled && (
          <Bar
            x={margin.left}
            y={margin.top}
            width={xMax}
            height={yMax}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => {
              hideTooltip();
              setHoveredBar(null);
            }}
          />
        )}
        {showAxisY && (
          <AxisLeft
            top={margin.top}
            left={margin.left}
            numTicks={numTicksY}
            tickStroke={theme.colors.textAlt}
            tickLabelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.small,
              textAnchor: 'end',
            }}
            scale={yScale}
            label={axisYLabel}
          />
        )}

        {showAxisX && (
          <AxisBottom
            top={yMax + margin.top}
            left={margin.left}
            tickStroke={theme.colors.textAlt}
            tickLabelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.small,
              textAnchor: 'end',
              angle: -45,
              dy: '0.25em',
            }}
            tickFormat={(value) => {
              const maxLength = 15;
              const str = String(value);
              return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
            }}
            scale={xScale}
            label={axisXLabel}
          />
        )}

        {showBrush && (
          <>
            {/* brush chart */}
            <Group left={brushMargin.left} top={topChartHeight + topChartBottomMargin + margin.top}>
              {data.map((d) => {
                const xVal = xAccessor(d);
                const barWidth = xBrushScale.bandwidth();
                const barHeight = yBrushMax - (yBrushScale(yAccessor(d)) ?? 0);
                return (
                  <Bar
                    key={`bar-${xVal}`}
                    x={xBrushScale(xVal)}
                    y={yBrushMax - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={shade(0.5, theme.colors.primary)}
                  />
                );
              })}
              <PatternLines
                id={PATTERN_ID}
                height={8}
                width={8}
                stroke={theme.colors.backgroundAccent}
                strokeWidth={1}
                orientation={['diagonal']}
              />
              <Brush
                xScale={xBrushScale}
                yScale={yBrushScale}
                width={xBrushMax}
                height={yBrushMax}
                innerRef={brushRef}
                resizeTriggerAreas={['left', 'right']}
                brushDirection="horizontal"
                margin={brushMargin}
                onChange={onBrushChange}
                selectedBoxStyle={{
                  fill: `url(#${PATTERN_ID})`,
                  stroke: theme.colors.backgroundAccent,
                }}
                useWindowMoveEvents
                handleSize={8}
                renderBrushHandle={(props) => <BrushHandle {...props} />}
              />
            </Group>
          </>
        )}
      </svg>
      {showTooltipEnabled && tooltipData && (
        <div>
          <TooltipWithBounds
            key={`${name}-tooltip`}
            top={tooltipTop + margin.top}
            left={tooltipLeft + margin.left}
            style={getDefaultTooltipStyles(theme)}
          >
            {tooltipAccessor ? tooltipAccessor(tooltipData) : yAccessor(tooltipData)}
          </TooltipWithBounds>
        </div>
      )}
    </div>
  );
};
