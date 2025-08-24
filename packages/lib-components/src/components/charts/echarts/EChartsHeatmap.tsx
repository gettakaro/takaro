import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';
import { useTheme } from '../../../hooks';

export interface EChartsHeatmapProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  xAccessor: (d: T) => number;
  yAccessor: (d: T) => number;
  valueAccessor: (d: T) => number;
  xCategories?: string[];
  yCategories?: string[];
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLabel?: boolean;
  tooltipFormatter?: (params: any) => string;
  minValue?: number;
  maxValue?: number;
}

export const EChartsHeatmap: FC<EChartsHeatmapProps> = ({
  data,
  xAccessor,
  yAccessor,
  valueAccessor,
  xCategories,
  yCategories,
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  showLabel = false,
  tooltipFormatter,
  minValue,
  maxValue,
  ...chartProps
}) => {
  const theme = useTheme();

  const option: EChartsOption = useMemo(() => {
    const heatmapData = data.map((d) => [xAccessor(d), yAccessor(d), valueAccessor(d)]);
    const values = data.map(valueAccessor);
    const min = minValue !== undefined ? minValue : Math.min(...values);
    const max = maxValue !== undefined ? maxValue : Math.max(...values);

    // Default categories if not provided
    const defaultXCategories = Array.from(new Set(data.map(xAccessor)))
      .sort((a, b) => a - b)
      .map(String);
    const defaultYCategories = Array.from(new Set(data.map(yAccessor)))
      .sort((a, b) => a - b)
      .map(String);

    return {
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: 'center',
          }
        : undefined,
      tooltip: {
        position: 'top',
        formatter: tooltipFormatter,
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xCategories || defaultXCategories,
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: yCategories || defaultYCategories,
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: min,
        max: max,
        calculable: true,
        orient: 'vertical',
        right: '0%',
        top: 'middle',
        inRange: {
          color: [theme.colors.background, theme.colors.primary + '40', theme.colors.primary],
        },
      },
      series: [
        {
          name: 'Heatmap',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: showLabel,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [
    data,
    xAccessor,
    yAccessor,
    valueAccessor,
    xCategories,
    yCategories,
    title,
    subtitle,
    xAxisLabel,
    yAxisLabel,
    showLabel,
    tooltipFormatter,
    minValue,
    maxValue,
    theme,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
