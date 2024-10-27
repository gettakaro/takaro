import { MouseEvent, useCallback } from 'react';

import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';
import { useTooltipInPortal, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { shade } from 'polished';

import { useTheme } from '../../../hooks';
import { getChartColors, getDefaultTooltipStyles, InnerChartProps, Margin } from '../util';
import { EmptyChart } from '../EmptyChart';

type PieChartVariant = 'pie' | 'donut';

export interface PieChartProps<T> {
  name: string;
  data: T[];
  variant: PieChartVariant;
  margin?: Margin;
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  tooltipAccessor: (d: T) => string;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const PieChart = <T,>({
  data,
  yAccessor,
  xAccessor,
  tooltipAccessor,
  name,
  margin = defaultMargin,
  variant,
}: PieChartProps<T>) => {
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
            variant={variant}
            yAccessor={yAccessor}
            xAccessor={xAccessor}
            tooltipAccessor={tooltipAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerPieChartProps<T> = InnerChartProps & PieChartProps<T>;

const Chart = <T,>({
  width,
  xAccessor,
  yAccessor,
  data,
  name,
  height,
  variant,
  tooltipAccessor,
  margin = defaultMargin,
}: InnerPieChartProps<T>) => {
  const theme = useTheme();
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<string>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const donutThickness = 50;

  const getArcColor = scaleOrdinal({
    domain: data.map(xAccessor),
    range: getChartColors(theme),
  });
  const pieSortValues = (a: number, b: number) => b - a;

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

  return width < 10 ? null : (
    <svg ref={containerRef} id={name} width={width} height={height}>
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={data}
          outerRadius={radius}
          innerRadius={variant === 'donut' ? radius - donutThickness : 0}
          cornerRadius={3}
          padAngle={0.02}
          pieSortValues={pieSortValues}
          pieValue={yAccessor}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc) ?? '';
              const arcFill = getArcColor(xAccessor(arc.data));
              return (
                <g key={`arc-${arc.data}-${index}`}>
                  <path
                    d={arcPath}
                    fill={shade(0.5, arcFill)}
                    stroke={arcFill}
                    strokeWidth={1}
                    onMouseOut={hideTooltip}
                    onMouseOver={(e) => handleMouseOver(e, arc.data)}
                  />
                  {hasSpaceForLabel && (
                    <text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="white"
                      fontSize={9}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {xAccessor(arc.data)}
                    </text>
                  )}
                </g>
              );
            });
          }}
        </Pie>
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
