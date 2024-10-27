import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { AxisTop, AxisLeft } from '@visx/axis';
import { HeatmapRect } from '@visx/heatmap';
import { useTooltipInPortal } from '@visx/tooltip';
import { scaleLinear, scaleBand } from '@visx/scale';

import { InnerChartProps, Margin } from '../util';
import { useTheme } from '../../../hooks';
import { EmptyChart } from '../EmptyChart';

interface InnerBin {
  bin: number;
  count: number;
  tooltip: string;
}

interface OuterBin {
  bin: number;
  bins: InnerBin[];
}

const DATE_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface HeatmapProps<T> {
  name: string;
  data: T[];
  variant?: 'month';
  margin?: Margin;
  xAccessor: (d: T) => number;
  yAccessor: (d: T) => number;
  zAccessor: (d: T) => number;
  tooltipAccessor: (d: T) => string;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const HeatMap = <T,>({
  data,
  yAccessor,
  xAccessor,
  zAccessor,
  variant,
  tooltipAccessor,
  name,
  margin = defaultMargin,
}: HeatmapProps<T>) => {
  if (!data || data.length === 0) return <EmptyChart />;

  return (
    <>
      <ParentSize>
        {(parent) => (
          <Chart<T>
            name={name}
            data={data}
            width={parent.width}
            variant={variant}
            height={parent.height}
            margin={margin}
            yAccessor={yAccessor}
            xAccessor={xAccessor}
            zAccessor={zAccessor}
            tooltipAccessor={tooltipAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerHeatmapProps<T> = InnerChartProps & HeatmapProps<T>;

const Chart = <T,>({
  data,
  width,
  height,
  margin = defaultMargin,
  xAccessor,
  yAccessor,
  zAccessor,
  tooltipAccessor,
}: InnerHeatmapProps<T>) => {
  const theme = useTheme();

  const { containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const colorMax = Math.max(...data.map(yAccessor));

  const xScale = scaleBand<number>({
    domain: [0, 1, 2, 3, 4], // 5 weeks in a month
    range: [margin.left, width - margin.right],
  });
  const yScale = scaleBand<number>({
    domain: [0, 1, 2, 3, 4, 5, 6], // 7 days of the week
    range: [margin.top, height - margin.bottom],
  });
  const colorScale = scaleLinear<string>({
    domain: [0, colorMax],
    range: [theme.colors.primary, theme.colors.primary],
  });
  const opacityScale = scaleLinear<number>({
    domain: [0, colorMax],
    range: [0.1, 1],
  });
  const xAxisScale = scaleBand<number>({
    domain: Array.from({ length: 5 }), // Adjust as needed for weeks in the month
    range: [0, width - margin.left - margin.right],
  });

  const yAxisScale = scaleBand<string>({
    domain: DATE_LABELS,
    range: [0, height - margin.top - margin.bottom],
  });

  const transformedData = transformData(data, xAccessor, yAccessor, zAccessor, tooltipAccessor);

  return width < 10 ? null : (
    <svg ref={containerRef} width={width} height={height}>
      <AxisTop
        scale={xAxisScale}
        top={margin.top}
        left={margin.left}
        tickLength={4}
        tickStroke={theme.colors.backgroundAccent}
        stroke={theme.colors.backgroundAccent}
        tickLabelProps={() => ({
          y: -7,
          textAnchor: 'middle',
        })}
      />
      <AxisLeft
        scale={yAxisScale}
        left={margin.left}
        orientation="left"
        hideTicks
        stroke={theme.colors.backgroundAccent}
        tickLabelProps={(_value, index) => ({
          textAnchor: 'end',
          fontSize: theme.fontSize.tiny,
          fill: index % 2 === 1 ? theme.colors.text : 'none', // Show label for even indices,
          dy: '1.25rem',
        })}
      />
      <Group>
        <HeatmapRect<OuterBin, InnerBin>
          data={transformedData}
          xScale={(d) => xScale(d) ?? 0}
          yScale={(bin) => yScale(bin) ?? 0}
          count={(bin) => bin.count}
          bins={(bin) => bin.bins}
          colorScale={colorScale}
          opacityScale={opacityScale}
          binWidth={xScale.bandwidth()}
          binHeight={yScale.bandwidth()}
          gap={1}
        >
          {(heatmap) =>
            heatmap.map((heatmapBins) =>
              heatmapBins.map((bin) => {
                return (
                  <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={bin.color}
                    fillOpacity={bin.opacity}
                  />
                );
              }),
            )
          }
        </HeatmapRect>
      </Group>
    </svg>
  );
};

// transforms data to the structure expected by HeatmapRect
// In our case, each bins will have a count of 1, since the data will already be aggregated
// example:
// [
//   {
//     bin: 0,
//     bins: [
//       { bin: 0, count: 0 },
//       { bin: 4, count: 0 },
//      ]
//   },
//   {
//     bin: 1,
//     bins: [
//       { bin: 0, count: 1 },
//      ]
//   },
function transformData<T>(
  data: T[],
  xAccessor: (d: T) => number,
  yAccessor: (d: T) => number,
  zAccessor: (d: T) => number,
  tooltipAccessor: (d: T) => string,
): OuterBin[] {
  const map = new Map<number, Map<number, { count: number; tooltip: string }>>();

  data.forEach((d) => {
    const xValue = xAccessor(d);
    const yValue = yAccessor(d);
    const zValue = zAccessor(d);
    const tooltipValue = tooltipAccessor(d);

    if (!map.has(xValue)) {
      map.set(xValue, new Map<number, { count: number; tooltip: string }>());
    }

    const innerMap = map.get(xValue)!;
    innerMap.set(yValue, { count: zValue, tooltip: tooltipValue });
  });

  // Convert to the structure expected by HeatmapRect
  const transformedData: OuterBin[] = Array.from(map, ([bin, innerBins]) => ({
    bin,
    bins: Array.from(innerBins, ([bin, { count, tooltip }]) => ({ bin, count, tooltip })),
  }));

  return transformedData;
}
