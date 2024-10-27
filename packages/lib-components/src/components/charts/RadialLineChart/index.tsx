import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LineRadial } from '@visx/shape';
import { scaleTime, scaleLog, NumberLike } from '@visx/scale';
import { GridAngle, GridRadial } from '@visx/grid';
import { AxisLeft } from '@visx/axis';
import { motion } from 'framer-motion';
import { extent } from '@visx/vendor/d3-array';
import { curveBasisOpen } from '@visx/curve';

import { InnerChartProps, Margin } from '../util';
import { useTheme } from '../../../hooks';
import { useGradients } from '../useGradients';
import { EmptyChart } from '../EmptyChart';

const formatTicks = (val: NumberLike) => String(val);

export interface RadialLineChartProps<T> {
  name: string;
  data: T[];
  margin?: Margin;
  xAccessor: (d: T) => number;
  yAccessor: (d: T) => number;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const RadialLineChart = <T,>({
  data,
  yAccessor,
  xAccessor,
  name,
  margin = defaultMargin,
}: RadialLineChartProps<T>) => {
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
            yAccessor={yAccessor}
            xAccessor={xAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerRadialLineChartProps<T> = InnerChartProps & RadialLineChartProps<T>;

const Chart = <T,>({ width, xAccessor, yAccessor, data, name, height }: InnerRadialLineChartProps<T>) => {
  const theme = useTheme();
  const gradients = useGradients(name);

  const xScale = scaleTime<number>({
    range: [0, Math.PI * 2],
    domain: extent(data, xAccessor) as [number, number],
  });

  const yScale = scaleLog<number>({
    domain: extent(data, yAccessor) as [number, number],
  });

  const firstPoint = yAccessor(data[0]);
  const lastPoint = yAccessor(data[data.length - 1]);

  const angle = (d: T) => xScale(xAccessor(d)) ?? 0;
  const radius = (d: T) => yScale(yAccessor(d)) ?? 0;
  const padding = 15;

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  const reverseYScale = yScale.copy().range(yScale.range().reverse());

  return width < 10 ? null : (
    <svg width={width} height={height}>
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
                strokeWidth={2}
                strokeOpacity={0.8}
                strokeLinecap="round"
                fill="none"
                stroke={theme.colors.primary}
              />
            );
          }}
        </LineRadial>
        {[firstPoint, lastPoint].map((d, i) => {
          const cx = ((xScale(d) ?? 0) * Math.PI) / 180;
          const cy = -(yScale(d) ?? 0);
          return <circle key={`line-cap-${i}`} cx={cx} cy={cy} fill={theme.colors.primary} r={2} />;
        })}
      </Group>
    </svg>
  );
};
