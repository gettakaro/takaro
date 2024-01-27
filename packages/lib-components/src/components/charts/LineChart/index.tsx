import { extent, max } from '@visx/vendor/d3-array';
import * as allCurves from '@visx/curve';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

import { useTheme } from '../../../hooks';
import { useMemo } from 'react';
import { Margin, ChartProps, InnerChartProps } from '../util';

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;

type CurveType = keyof typeof allCurves;

export interface LineChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => Date;
  yAccessor: (d: T) => number;
  margin?: Margin;
  curveType?: CurveType;
}

export const LineChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  margin = defaultMargin,
  name,
  axisYLabel,
  axisXLabel,
  showGrid,
  showAxisX = defaultShowAxisX,
  showAxisY = defaultShowAxisY,
  curveType = 'curveBasis',
}: LineChartProps<T>) => {
  if (!data || data.length === 0) return null;

  return (
    <ParentSize>
      {(parent) => (
        <Chart<T>
          name={name}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
          data={data}
          width={parent.width}
          height={parent.height}
          showGrid={showGrid}
          margin={margin}
          axisYLabel={axisYLabel}
          axisXLabel={axisXLabel}
          showAxisX={showAxisX}
          showAxisY={showAxisY}
          curveType={curveType}
        />
      )}
    </ParentSize>
  );
};

type InnerLineChartProps<T> = InnerChartProps & LineChartProps<T>;

const Chart = <T,>({
  width,
  height,
  curveType = 'curveBasis',
  data,
  xAccessor,
  yAccessor,
  margin = defaultMargin,
  showAxisX,
  showAxisY,
  axisYLabel,
  axisXLabel,
}: InnerLineChartProps<T>) => {
  const theme = useTheme();

  const bottomAxisHeight = showAxisX ? 25 : 0;
  const leftAxisWidth = showAxisX ? 25 : 0;
  const innerWidth = width - margin.left - margin.right - leftAxisWidth;
  const innerHeight = height - margin.top - margin.bottom - bottomAxisHeight;

  const xScale = useMemo(
    () =>
      scaleTime<number>({
        range: [margin.left, innerWidth],
        domain: extent(data, xAccessor) as [Date, Date],
      }),
    [innerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [innerHeight, margin.bottom],
        domain: [0, max(data, yAccessor) as number],
      }),
    [innerHeight]
  );

  return width === 10 ? null : (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill={theme.colors.background} rx={14} ry={14} />
      <Group top={margin.top} left={margin.left}>
        <LinePath<T>
          curve={allCurves[curveType]}
          data={data}
          x={(d) => xScale(xAccessor(d)) ?? 0}
          y={(d) => yScale(yAccessor(d)) ?? 0}
          stroke={theme.colors.primary}
          strokeWidth={1.2}
          strokeOpacity={0.6}
          shapeRendering="geometricPrecision"
        />
      </Group>
      {showAxisY && (
        <AxisLeft
          top={margin.top}
          left={margin.left + margin.left}
          strokeWidth={1}
          hideZero
          stroke={theme.colors.backgroundAlt}
          labelOffset={42}
          tickStroke={theme.colors.backgroundAlt}
          tickLabelProps={{
            fill: theme.colors.text,
            fontSize: theme.fontSize.small,
            textAnchor: 'end',
          }}
          scale={yScale}
          label={axisYLabel}
        />
      )}
      {showAxisX && (
        <AxisBottom
          top={innerHeight + margin.top}
          left={margin.left}
          strokeWidth={1}
          stroke={theme.colors.backgroundAlt}
          hideZero
          tickLabelProps={{
            fill: theme.colors.text,
            fontSize: theme.fontSize.small,
            textAnchor: 'middle',
          }}
          labelProps={{
            fill: theme.colors.textAlt,
          }}
          scale={xScale}
          label={axisXLabel}
        />
      )}
    </svg>
  );
};
