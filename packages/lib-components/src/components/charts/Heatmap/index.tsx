import { InnerChartProps } from '..';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisTop, AxisLeft } from '@visx/axis';
import { HeatmapRect } from '@visx/heatmap';
import { useTheme } from '../../../hooks';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { scaleBand } from '@visx/scale';
import { Svg } from './style';
import { MouseEvent } from 'react';

const DATE_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_LABELS = [
  ' 1 AM',
  ' 2 AM',
  ' 3 AM',
  ' 4 AM',
  ' 5 AM',
  ' 6 AM',
  ' 7 AM',
  ' 8 AM',
  ' 9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  ' 1 PM',
  ' 2 PM',
  ' 3 PM',
  ' 4 PM',
  ' 5 PM',
  ' 6 PM',
  ' 7 PM',
  ' 8 PM',
  ' 9 PM',
  '10 PM',
  '11 PM',
  '12 AM',
];

export interface HeatmapProps<T> {
  name: string;
  data: T[];
  variant?: 'month';
  // amount of rectangles
  xAccessor: (d: T) => string;
  // value of each rectangle
  yAccessor: (d: T) => number;
}

export const HeatMap = <T,>({ data, yAccessor, xAccessor, variant, name }: HeatmapProps<T>) => {
  return (
    <>
      <ParentSize>
        {(parent) => (
          <Chart
            name={name}
            data={data}
            width={parent.width}
            variant={variant}
            height={parent.height}
            yAccessor={yAccessor}
            xAccessor={xAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerHeatmapProps<T> = InnerChartProps & HeatmapProps<T>;

const Chart = <T,>({ data, yAccessor }: InnerHeatmapProps<T>) => {
  const theme = useTheme();
  const colorMax = Math.max(...data.map(yAccessor));

  type ToolTipData = {
    row: number;
    column: number;
    count: number;
  };

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<ToolTipData>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const handleMouseOver = (event: MouseEvent) => {
    const target = event.target as SVGElement;
    const coords = localPoint(target.ownerSVGElement!, event);
    // Access and parse the data-bin attribute
    const binData = target.dataset.bin ? JSON.parse(target.dataset.bin) : null;
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: binData,
    });
  };

  const xScale = scaleLinear<number>({
    domain: [0, data.length],
  });
  const yScale = scaleLinear<number>({
    domain: [0, 30],
  });
  const colorScale = scaleLinear<string>({
    range: [theme.colors.backgroundAlt, theme.colors.primary],
    domain: [0, colorMax],
  });
  const opacityScale = scaleLinear<number>({
    range: [0.1, 1],
    domain: [0, colorMax],
  });
  const xAxisScale = scaleBand({
    domain: DATE_LABELS.map((date) => date),
    range: [24, 209],
  });
  const yAxisScale = scaleBand({
    domain: TIME_LABELS.map((time) => time),
    range: [13, 396],
  });

  return (
    <Svg ref={containerRef} viewBox="0 0 214 4003">
      <AxisTop
        scale={xAxisScale}
        top={14}
        tickLength={4}
        tickClassName="tick"
        tickStroke="grey"
        stroke={'#aaa'}
        tickLabelProps={() => ({
          className: 'tick-label',
          y: -7,
          textAnchor: 'middle',
        })}
      />
      <AxisLeft
        scale={yAxisScale}
        left={24}
        orientation="left"
        tickLength={4}
        tickClassName="tick"
        tickStroke="grey"
        stroke={'#aaa'}
        numTicks={24}
        tickLabelProps={() => ({
          className: 'tick-label',
          transform: 'translate(0, 2)',
          x: -22,
          textAnchor: 'start',
        })}
      />
      <Group left={20}>
        <HeatmapRect
          data={data}
          xScale={xScale}
          yScale={yScale}
          colorScale={colorScale}
          opacityScale={opacityScale}
          gap={2}
        >
          {(heatmap) =>
            heatmap.map((heatmapBins) =>
              heatmapBins.map((bin) => (
                <rect
                  key={`heatmap-rect-${bin.row}-${bin.column}`}
                  width={bin.width}
                  height={bin.height}
                  x={bin.x}
                  y={bin.y}
                  fill={bin.color}
                  fillOpacity={bin.opacity}
                  onMouseOver={handleMouseOver}
                  onMouseOut={hideTooltip}
                  data-bin={JSON.stringify({
                    row: bin.row,
                    column: bin.column,
                    count: bin.count,
                  })}
                />
              ))
            )
          }
        </HeatmapRect>
      </Group>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft}>
          <div className="tooltip">
            <time>
              {DATE_LABELS[tooltipData.column]}
              {' | '}
              {TIME_LABELS[tooltipData.row]}
            </time>
            <p>
              <strong>{tooltipData.count} </strong>
              some tooltip stuff here
            </p>
          </div>
        </TooltipInPortal>
      )}
    </Svg>
  );
};
