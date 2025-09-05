import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';

export interface EChartsFunnelProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  nameAccessor: (d: T) => string;
  valueAccessor: (d: T) => number;
  seriesName?: string;
  showLegend?: boolean;
  showLabel?: boolean;
  title?: string;
  subtitle?: string;
  sort?: 'ascending' | 'descending' | 'none';
  gap?: number;
  tooltipFormatter?: (params: any) => string;
  labelPosition?: 'left' | 'right' | 'inside';
}

export const EChartsFunnel: FC<EChartsFunnelProps> = ({
  data,
  nameAccessor,
  valueAccessor,
  seriesName = 'Funnel',
  showLegend = true,
  showLabel = true,
  title,
  subtitle,
  sort = 'descending',
  gap = 2,
  tooltipFormatter,
  labelPosition = 'inside',
  ...chartProps
}) => {
  const option: EChartsOption = useMemo(() => {
    const funnelData = data.map((d) => ({
      name: nameAccessor(d),
      value: valueAccessor(d),
    }));

    return {
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: 'center',
          }
        : undefined,
      legend: showLegend
        ? {
            orient: 'vertical',
            left: 'left',
            top: 'middle',
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        formatter: tooltipFormatter || '{a} <br/>{b}: {c} ({d}%)',
      },
      series: [
        {
          name: seriesName,
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: sort,
          gap: gap,
          label: {
            show: showLabel,
            position: labelPosition,
            formatter: '{b}: {c}',
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderWidth: 0,
          },
          emphasis: {
            label: {
              fontSize: 20,
            },
          },
          data: funnelData,
        },
      ],
    };
  }, [
    data,
    nameAccessor,
    valueAccessor,
    seriesName,
    showLegend,
    showLabel,
    title,
    subtitle,
    sort,
    gap,
    tooltipFormatter,
    labelPosition,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
