import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import { InnerChartProps, getDefaultTooltipStyles, ChartProps, TooltipConfig } from '../util';
import { useTheme } from '../../../hooks';
import { useMemo, useCallback } from 'react';
import { EmptyChart } from '../EmptyChart';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

interface NormalizedCell<T = any> {
  x: number;
  y: number;
  value: number;
  displayValue: any;
  xLabel?: string;
  yLabel?: string;
  originalData?: T;
}

interface ProcessedData<T = any> {
  cells: NormalizedCell<T>[];
  xLabels: { label: string; index: number }[];
  yLabels: { label: string; index: number }[];
  maxValue: number;
  gridWidth: number;
  gridHeight: number;
}

// Calendar mode props
type CalendarModeProps<T> = {
  data: T[];
  dateAccessor: (d: T) => Date;
  valueAccessor: (d: T) => number;
  startDate?: Date;
  endDate?: Date;
  showMonthLabels?: boolean;
  xAccessor?: never;
  yAccessor?: never;
  xCategories?: never;
  yCategories?: never;
};

type CategoricalModeProps<T> = {
  data: T[];
  xAccessor: (d: T) => number | string;
  yAccessor: (d: T) => number | string;
  valueAccessor?: (d: T) => number;
  xCategories?: string[];
  yCategories?: string[];
  dateAccessor?: never;
  startDate?: never;
  endDate?: never;
  showMonthLabels?: never;
};

type SharedHeatmapProps<T> = {
  colors?: [string, string, string, string, string];
  showDayLabels?: boolean;
  tooltip?: TooltipConfig<T>;
};

export type HeatmapProps<T> = ChartProps & SharedHeatmapProps<T> & (CalendarModeProps<T> | CategoricalModeProps<T>);

const defaultMargin = { top: 30, right: 10, bottom: 10, left: 40 };

const getDefaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 364); // 52 weeks = 364 days
  // Round to previous Sunday
  date.setDate(date.getDate() - date.getDay());
  return date;
};

const getDefaultEndDate = () => new Date();

const processCalendarData = <T,>(
  data: T[],
  dateAccessor: (d: T) => Date,
  valueAccessor: (d: T) => number,
  startDate: Date,
  endDate: Date,
): ProcessedData<T> => {
  const dateValueMap = new Map<string, number>();
  const dateDataMap = new Map<string, T>();
  data.forEach((d) => {
    const date = dateAccessor(d);
    const dateStr = date.toISOString().split('T')[0];
    const value = valueAccessor(d);
    dateValueMap.set(dateStr, (dateValueMap.get(dateStr) || 0) + value);
    // Store the first data item for this date for tooltip purposes
    if (!dateDataMap.has(dateStr)) {
      dateDataMap.set(dateStr, d);
    }
  });

  const cellsData: NormalizedCell<T>[] = [];
  const monthLabelsData: { label: string; index: number }[] = [];
  const currentDate = new Date(startDate);
  let weekIndex = 0;
  let lastMonth = -1;
  let lastDayIndex = 0;

  while (currentDate <= endDate) {
    const dayIndex = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const dateStr = currentDate.toISOString().split('T')[0];
    const value = dateValueMap.get(dateStr) || 0;

    cellsData.push({
      x: weekIndex,
      y: dayIndex,
      value,
      displayValue: new Date(currentDate),
      originalData: dateDataMap.get(dateStr),
    });

    // Track month changes for labels
    if (dayIndex === 0 && currentDate.getMonth() !== lastMonth) {
      lastMonth = currentDate.getMonth();
      if (weekIndex >= 2 || currentDate.getDate() <= 7) {
        monthLabelsData.push({
          label: MONTH_LABELS[lastMonth],
          index: weekIndex,
        });
      }
    }

    lastDayIndex = dayIndex;
    currentDate.setDate(currentDate.getDate() + 1);

    // If we completed a week (Saturday), move to next week column
    if (dayIndex === 6) {
      weekIndex++;
    }
  }

  const maxValue = Math.max(...cellsData.map((c) => c.value), 1);

  const dayLabels = DAY_LABELS.map((label, index) => ({ label, index })).filter((l) => l.label);

  // Only add an extra column if the last day was not Saturday (incomplete week)
  const gridWidth = lastDayIndex === 6 ? weekIndex : weekIndex + 1;

  return {
    cells: cellsData,
    xLabels: monthLabelsData,
    yLabels: dayLabels,
    maxValue,
    gridWidth,
    gridHeight: 7,
  };
};

const processCategoricalData = <T,>(
  data: T[],
  xAccessor: (d: T) => number | string,
  yAccessor: (d: T) => number | string,
  valueAccessor: (d: T) => number = (d: any) => d.value || 0,
  xCategories?: string[],
  yCategories?: string[],
): ProcessedData<T> => {
  const rawXValues = Array.from(new Set(data.map(xAccessor)));
  const rawYValues = Array.from(new Set(data.map(yAccessor)));

  const useCustomXCategories = xCategories && xCategories.length > 0;
  const useCustomYCategories = yCategories && yCategories.length > 0;

  // Build value map and data map using RAW data values as keys
  const valueMap = new Map<string, number>();
  const dataMap = new Map<string, T>();
  data.forEach((d) => {
    const x = xAccessor(d);
    const y = yAccessor(d);
    const key = `${x}-${y}`;
    const value = valueAccessor(d);
    valueMap.set(key, (valueMap.get(key) || 0) + value);
    if (!dataMap.has(key)) {
      dataMap.set(key, d);
    }
  });

  const xValueToLabel = useCustomXCategories
    ? new Map(rawXValues.map((val, _idx) => [val, xCategories![Number(val)] || String(val)]))
    : new Map(rawXValues.map((val) => [val, String(val)]));

  const yValueToLabel = useCustomYCategories
    ? new Map(rawYValues.map((val, _idx) => [val, yCategories![Number(val)] || String(val)]))
    : new Map(rawYValues.map((val) => [val, String(val)]));

  const cells: NormalizedCell<T>[] = [];
  const sortedRawYValues = rawYValues.sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a).localeCompare(String(b));
  });
  const sortedRawXValues = rawXValues.sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a).localeCompare(String(b));
  });

  sortedRawYValues.forEach((yVal, yIdx) => {
    sortedRawXValues.forEach((xVal, xIdx) => {
      const key = `${xVal}-${yVal}`;
      cells.push({
        x: xIdx,
        y: yIdx,
        value: valueMap.get(key) || 0,
        displayValue: { x: xVal, y: yVal },
        xLabel: xValueToLabel.get(xVal) || String(xVal),
        yLabel: yValueToLabel.get(yVal) || String(yVal),
        originalData: dataMap.get(key),
      });
    });
  });

  const maxValue = Math.max(...cells.map((c) => c.value), 1);

  const xLabels = sortedRawXValues.map((val, index) => ({
    label: xValueToLabel.get(val) || String(val),
    index,
  }));

  const yLabels = sortedRawYValues.map((val, index) => ({
    label: yValueToLabel.get(val) || String(val),
    index,
  }));

  return {
    cells,
    xLabels,
    yLabels,
    maxValue,
    gridWidth: sortedRawXValues.length,
    gridHeight: sortedRawYValues.length,
  };
};

export const HeatMap = <T,>(props: HeatmapProps<T>) => {
  const { data, name, colors, showDayLabels = true, margin = defaultMargin, animate = true, tooltip } = props;
  const isCategorical = 'xAccessor' in props && props.xAccessor !== undefined;
  const hasData = data && data.length > 0;

  return (
    <ParentSize>
      {hasData
        ? (parent) => (
            <Chart<T>
              {...props}
              name={name}
              data={data}
              width={parent.width}
              height={parent.height}
              margin={margin}
              tooltip={tooltip}
              colors={colors}
              showDayLabels={showDayLabels}
              animate={animate}
              isCategorical={isCategorical}
            />
          )
        : () => <EmptyChart />}
    </ParentSize>
  );
};

type InnerHeatmapProps<T> = InnerChartProps & HeatmapProps<T> & { isCategorical: boolean };

const Chart = <T,>(props: InnerHeatmapProps<T>) => {
  const {
    data,
    width,
    height,
    margin = defaultMargin,
    tooltip,
    name,
    colors,
    showDayLabels = true,
    animate = true,
    isCategorical,
  } = props;

  const tooltipAccessor = tooltip?.accessor;
  const theme = useTheme();

  const _animate = animate;
  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<NormalizedCell<T>>();

  const defaultColors: [string, string, string, string, string] = [
    `${theme.colors.backgroundAccent}33`,
    `${theme.colors.primary}33`,
    `${theme.colors.primary}66`,
    `${theme.colors.primary}99`,
    theme.colors.primary,
  ];

  const colorScale = colors || defaultColors;

  const processedData = useMemo(() => {
    if (isCategorical) {
      const catProps = props as InnerHeatmapProps<T> & CategoricalModeProps<T>;
      return processCategoricalData(
        data,
        catProps.xAccessor,
        catProps.yAccessor,
        catProps.valueAccessor,
        catProps.xCategories,
        catProps.yCategories,
      );
    } else {
      const calProps = props as InnerHeatmapProps<T> & CalendarModeProps<T>;
      return processCalendarData(
        data,
        calProps.dateAccessor,
        calProps.valueAccessor,
        calProps.startDate || getDefaultStartDate(),
        calProps.endDate || getDefaultEndDate(),
      );
    }
  }, [data, isCategorical, props]);

  const dayLabelWidth = showDayLabels ? (isCategorical ? 40 : 30) : 0;
  const showXLabels = isCategorical || (props as any).showMonthLabels !== false;
  const xLabelHeight = showXLabels ? 20 : 0;

  // Calculate dynamic cell size based on available space
  const availableWidth = width - margin.left - margin.right - dayLabelWidth;
  const availableHeight = height - margin.top - margin.bottom - xLabelHeight;

  const cellGap = 3;
  const maxCellWidth = Math.max(
    (availableWidth - cellGap * (processedData.gridWidth - 1)) / processedData.gridWidth,
    0,
  );
  const maxCellHeight = Math.max(
    (availableHeight - cellGap * (processedData.gridHeight - 1)) / processedData.gridHeight,
    0,
  );
  const cellSize = Math.max(Math.min(maxCellWidth, maxCellHeight, 20), 1);

  const mapValueToColor = (value: number): string => {
    if (value === 0) return colorScale[0];
    const level = Math.min(4, Math.ceil((value / processedData.maxValue) * 4));
    return colorScale[level];
  };

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleMouseOver = useCallback(
    (event: React.MouseEvent<SVGRectElement>, cell: NormalizedCell<T>) => {
      const coords = localPoint(event) || { x: 0, y: 0 };
      showTooltip({
        tooltipData: cell,
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
      });
    },
    [showTooltip],
  );

  return width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <Group top={margin.top + xLabelHeight} left={margin.left + dayLabelWidth}>
          {/* X-axis labels (month labels for calendar, category labels for categorical) */}
          {showXLabels &&
            processedData.xLabels
              .filter((label) => {
                // For categorical mode with many labels, show every nth label to prevent overlap
                if (isCategorical && processedData.xLabels.length > 12) {
                  // Show every 3rd label for better spacing
                  return label.index % 3 === 0;
                }
                return true;
              })
              .map((label) => (
                <text
                  key={`x-${label.index}`}
                  x={label.index * (cellSize + cellGap) + (isCategorical ? cellSize / 2 : 0)}
                  y={-8}
                  fill={theme.colors.text}
                  fontSize={theme.fontSize.tiny}
                  fontWeight={500}
                  textAnchor={isCategorical ? 'middle' : 'start'}
                >
                  {label.label}
                </text>
              ))}

          {showDayLabels &&
            processedData.yLabels.map((label) => (
              <text
                key={`y-${label.index}`}
                x={-8}
                y={label.index * (cellSize + cellGap) + cellSize / 2}
                fill={theme.colors.textAlt}
                fontSize={theme.fontSize.tiny}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {label.label}
              </text>
            ))}

          {processedData.cells.map((cell, i) => (
            <rect
              key={`cell-${i}`}
              x={cell.x * (cellSize + cellGap)}
              y={cell.y * (cellSize + cellGap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={mapValueToColor(cell.value)}
              stroke={theme.colors.backgroundAlt}
              strokeWidth={0.5}
              onMouseOver={(e) => handleMouseOver(e, cell)}
              onMouseLeave={hideTooltip}
              style={{
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.stroke = theme.colors.text;
                e.currentTarget.style.strokeWidth = '1.5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.stroke = theme.colors.backgroundAlt;
                e.currentTarget.style.strokeWidth = '0.5';
              }}
            />
          ))}
        </Group>
      </svg>
      {tooltipData && (
        <TooltipWithBounds key={name} top={tooltipTop} left={tooltipLeft} style={getDefaultTooltipStyles(theme)}>
          {tooltipAccessor && tooltipData.originalData ? (
            tooltipAccessor(tooltipData.originalData, tooltipData.displayValue, tooltipData.value)
          ) : isCategorical ? (
            <>
              {tooltipData.xLabel} - {tooltipData.yLabel}: {tooltipData.value}
            </>
          ) : (
            <>
              <strong>{tooltipData.value}</strong> contribution{tooltipData.value !== 1 ? 's' : ''} on{' '}
              {formatDate(tooltipData.displayValue as Date)}
            </>
          )}
        </TooltipWithBounds>
      )}
    </>
  );
};
