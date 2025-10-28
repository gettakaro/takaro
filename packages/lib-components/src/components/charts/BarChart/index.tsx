import { useMemo, useRef, useState } from 'react';

import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { scaleBand, scaleLinear } from '@visx/scale';
import { max } from '@visx/vendor/d3-array';
import { ParentSize } from '@visx/responsive';
import { Bounds } from '@visx/brush/lib/types';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Brush } from '@visx/brush';
import { PatternLines } from '@visx/pattern';
import { shade } from 'polished';

import { useGradients } from '../useGradients';
import { useTheme } from '../../../hooks';
import { ChartProps, InnerChartProps, BrushConfig } from '../util';
import { BrushHandle } from '../BrushHandle';

export interface BarChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  /** Brush/zoom configuration */
  brush?: BrushConfig;
}

const defaultMargin = { top: 20, left: 50, bottom: 20, right: 20 };
const defaultBrushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;

export const BarChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  name,
  grid = 'none',
  axis,
  brush,
  animate = true,
  margin = defaultMargin,
}: BarChartProps<T>) => {
  // TODO: handle empty data
  if (!data || data.length === 0) return null;

  // TODO: handle loading state

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
  brush,
  animate = true,
  name,
}: InnerBarChartProps<T>) => {
  const showAxisX = axis?.showX ?? defaultShowAxisX;
  const showAxisY = axis?.showY ?? defaultShowAxisY;
  const axisXLabel = axis?.labelX;
  const axisYLabel = axis?.labelY;

  const _animate = animate;
  // TODO: impl grid overlay
  const _grid = grid;

  const showBrush = brush?.enabled ?? false;
  const brushMargin = brush?.margin ?? defaultBrushMargin;
  const gradients = useGradients(name);
  const [filteredData, setFilteredData] = useState(data);

  const brushRef = useRef(null);

  const axisHeight = 100;
  const axisWidth = 20;
  const theme = useTheme();

  const PATTERN_ID = `${name}-brush_pattern`;

  // bounds
  const xMax = width;
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
        padding: 0.4,
      }),
    [xMax, filteredData],
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
      }),
    [xBrushMax],
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

  return (
    <svg width={width} height={height}>
      {gradients.background.gradient}
      {gradients.chart.gradient}
      <rect width={width} height={height} fill={`url(#${gradients.background.id})`} rx={14} />
      {
        <GridRows
          top={margin.top}
          left={margin.left + axisWidth}
          scale={yScale}
          width={xMax}
          height={yMax}
          stroke={theme.colors.backgroundAccent}
          strokeOpacity={1}
        />
      }
      <Group top={margin.top}>
        {filteredData.map((d) => {
          const xVal = xAccessor(d);
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(yAccessor(d)) ?? 0);
          return (
            <Bar
              key={`bar-${xVal}`}
              x={xScale(xVal)}
              y={yMax - barHeight}
              width={barWidth}
              height={barHeight}
              fill={shade(0.5, theme.colors.primary)}
              stroke={theme.colors.primary}
            />
          );
        })}
      </Group>
      {showAxisY && (
        <AxisLeft
          top={margin.top}
          left={margin.left}
          tickStroke={theme.colors.textAlt}
          tickLabelProps={{
            fill: theme.colors.textAlt,
            fontSize: theme.fontSize.small,
            textAnchor: 'middle',
          }}
          scale={yScale}
          label={axisYLabel}
        />
      )}

      {showAxisX && (
        <AxisBottom
          top={yMax + margin.top}
          tickStroke={theme.colors.textAlt}
          tickLabelProps={{
            fill: theme.colors.textAlt,
            fontSize: theme.fontSize.small,
            textAnchor: 'middle',
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
                  fill={`url(#${gradients.chart.id})`}
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
  );
};
