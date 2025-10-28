import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import { InnerChartProps, getDefaultTooltipStyles, ChartProps, TooltipConfig } from '../util';
import { useTheme } from '../../../hooks';
import { useMemo, useCallback } from 'react';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const; // Sunday to Saturday
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

interface CellData {
  date: Date;
  value: number;
  weekIndex: number;
  dayIndex: number;
}

interface MonthLabel {
  label: string;
  weekIndex: number;
}

export interface HeatmapProps<T> extends ChartProps {
  data: T[];
  /** Accessor to get the date from data item */
  dateAccessor: (d: T) => Date;
  /** Accessor to get the value/count from data item */
  valueAccessor: (d: T) => number;
  /** Start date. Default: 52 weeks ago from today */
  startDate?: Date;
  /** End date. Default: today */
  endDate?: Date;
  /** Custom 5-level color scale. Default: theme-based scale */
  colors?: [string, string, string, string, string];
  /** Show month labels. Default: true */
  showMonthLabels?: boolean;
  /** Show day labels. Default: true */
  showDayLabels?: boolean;
  /** Tooltip configuration. Note: accessor receives (d: T, date: Date, value: number) */
  tooltip?: TooltipConfig<T>;
}

const defaultMargin = { top: 30, right: 10, bottom: 10, left: 40 };

const getDefaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 364); // 52 weeks = 364 days
  // Round to previous Sunday
  date.setDate(date.getDate() - date.getDay());
  return date;
};

const getDefaultEndDate = () => new Date();

export const HeatMap = <T,>({
  data,
  dateAccessor,
  valueAccessor,
  name,
  startDate = getDefaultStartDate(),
  endDate = getDefaultEndDate(),
  colors,
  showMonthLabels = true,
  showDayLabels = true,
  margin = defaultMargin,
  animate = true,
  tooltip,
}: HeatmapProps<T>) => {
  return (
    <ParentSize>
      {(parent) => (
        <Chart<T>
          name={name}
          data={data}
          width={parent.width}
          height={parent.height}
          margin={margin}
          dateAccessor={dateAccessor}
          valueAccessor={valueAccessor}
          tooltip={tooltip}
          startDate={startDate}
          endDate={endDate}
          colors={colors}
          showMonthLabels={showMonthLabels}
          showDayLabels={showDayLabels}
          animate={animate}
        />
      )}
    </ParentSize>
  );
};

type InnerHeatmapProps<T> = InnerChartProps & HeatmapProps<T>;

const Chart = <T,>({
  data,
  width,
  height,
  margin = defaultMargin,
  dateAccessor,
  valueAccessor,
  tooltip,
  name,
  startDate = getDefaultStartDate(),
  endDate = getDefaultEndDate(),
  colors,
  showMonthLabels = true,
  showDayLabels = true,
  animate = true,
}: InnerHeatmapProps<T>) => {
  const tooltipAccessor = tooltip?.accessor;
  const theme = useTheme();

  const _animate = animate;
  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<CellData>();

  const defaultColors: [string, string, string, string, string] = [
    theme.colors.backgroundAlt, // No activity
    `${theme.colors.primary}33`, // Low activity (20% opacity)
    `${theme.colors.primary}66`, // Medium-low (40% opacity)
    `${theme.colors.primary}99`, // Medium-high (60% opacity)
    theme.colors.primary, // High activity (100%)
  ];

  const colorScale = colors || defaultColors;

  const { cells, monthLabels, maxValue } = useMemo(() => {
    const dateValueMap = new Map<string, number>();
    data.forEach((d) => {
      const date = dateAccessor(d);
      const dateStr = date.toISOString().split('T')[0];
      const value = valueAccessor(d);
      dateValueMap.set(dateStr, (dateValueMap.get(dateStr) || 0) + value);
    });

    // Generate all dates in range
    const cellsData: CellData[] = [];
    const monthLabelsData: MonthLabel[] = [];
    const currentDate = new Date(startDate);
    let weekIndex = 0;
    let lastMonth = -1;

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
      const dateStr = currentDate.toISOString().split('T')[0];
      const value = dateValueMap.get(dateStr) || 0;

      cellsData.push({
        date: new Date(currentDate),
        value,
        weekIndex,
        dayIndex,
      });

      // Track month changes for labels
      // Only add month label if it's on a Sunday AND we have at least 2 weeks of space from the start
      if (dayIndex === 0 && currentDate.getMonth() !== lastMonth) {
        lastMonth = currentDate.getMonth();
        // Skip the first month if we're not starting at the beginning of it (GitHub behavior)
        if (weekIndex >= 2 || currentDate.getDate() <= 7) {
          monthLabelsData.push({
            label: MONTH_LABELS[lastMonth],
            weekIndex,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);

      // If we completed a week (Saturday), move to next week column
      if (dayIndex === 6) {
        weekIndex++;
      }
    }

    const maxValue = Math.max(...cellsData.map((c) => c.value), 1);

    return { cells: cellsData, monthLabels: monthLabelsData, maxValue };
  }, [data, dateAccessor, valueAccessor, startDate, endDate]);

  // Calculate dimensions
  const cellSize = 12;
  const cellGap = 3;
  const dayLabelWidth = showDayLabels ? 30 : 0;
  const monthLabelHeight = showMonthLabels ? 20 : 0;

  const mapValueToColor = (value: number): string => {
    if (value === 0) return colorScale[0];
    const level = Math.min(4, Math.ceil((value / maxValue) * 4));
    return colorScale[level];
  };

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleMouseOver = useCallback(
    (event: React.MouseEvent<SVGRectElement>, cell: CellData) => {
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
        <rect width={width} height={height} fill={theme.colors.background} rx={14} ry={14} />
        <Group top={margin.top + monthLabelHeight} left={margin.left + dayLabelWidth}>
          {/* Month labels */}
          {showMonthLabels &&
            monthLabels.map((m) => (
              <text
                key={`month-${m.weekIndex}`}
                x={m.weekIndex * (cellSize + cellGap)}
                y={-8}
                fill={theme.colors.text}
                fontSize={theme.fontSize.small}
                fontWeight={500}
              >
                {m.label}
              </text>
            ))}

          {/* Day labels */}
          {showDayLabels &&
            DAY_LABELS.map((label, i) => {
              if (!label) return null;
              return (
                <text
                  key={`day-${i}`}
                  x={-8}
                  y={i * (cellSize + cellGap) + cellSize / 2}
                  fill={theme.colors.textAlt}
                  fontSize={theme.fontSize.tiny}
                  textAnchor="end"
                  alignmentBaseline="middle"
                >
                  {label}
                </text>
              );
            })}

          {/* Heat map cells */}
          {cells.map((cell, i) => (
            <rect
              key={`cell-${i}`}
              x={cell.weekIndex * (cellSize + cellGap)}
              y={cell.dayIndex * (cellSize + cellGap)}
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
          {tooltipAccessor ? (
            tooltipAccessor(
              data.find((d) => dateAccessor(d).toDateString() === tooltipData.date.toDateString())!,
              tooltipData.date,
              tooltipData.value,
            )
          ) : (
            <>
              <strong>{tooltipData.value}</strong> contribution{tooltipData.value !== 1 ? 's' : ''} on{' '}
              {formatDate(tooltipData.date)}
            </>
          )}
        </TooltipWithBounds>
      )}
    </>
  );
};
