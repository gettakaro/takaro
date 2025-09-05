import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';

export interface EChartsScatterProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  xAccessor: (d: T) => number;
  yAccessor: (d: T) => number;
  sizeAccessor?: (d: T) => number;
  nameAccessor?: (d: T) => string;
  seriesName?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  subtitle?: string;
  symbolSize?: number | ((value: number[]) => number);
  tooltipFormatter?: (params: any) => string;
}

export const EChartsScatter: FC<EChartsScatterProps> = ({
  data,
  xAccessor,
  yAccessor,
  sizeAccessor,
  nameAccessor,
  seriesName = 'Value',
  showGrid = true,
  showLegend = false,
  xAxisLabel,
  yAxisLabel,
  title,
  subtitle,
  symbolSize = 10,
  tooltipFormatter,
  ...chartProps
}) => {
  const option: EChartsOption = useMemo(() => {
    const scatterData = data.map((d) => {
      const point: any = [xAccessor(d), yAccessor(d)];
      if (sizeAccessor) {
        point.push(sizeAccessor(d));
      }
      if (nameAccessor) {
        return {
          value: point,
          name: nameAccessor(d),
        };
      }
      return point;
    });

    const actualSymbolSize = sizeAccessor ? (value: number[]) => Math.sqrt(value[2]) * 5 : symbolSize;

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
            data: [seriesName],
            top: 30,
          }
        : undefined,
      grid: showGrid
        ? {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        formatter:
          tooltipFormatter ||
          ((params: any) => {
            const value = params.value || params.data.value;
            const name = params.data?.name || params.name || '';
            return `${name}<br/>X: ${value[0]}<br/>Y: ${value[1]}${value[2] !== undefined ? `<br/>Size: ${value[2]}` : ''}`;
          }),
      },
      xAxis: {
        type: 'value',
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
      },
      series: [
        {
          name: seriesName,
          type: 'scatter',
          data: scatterData,
          symbolSize: actualSymbolSize,
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
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
    sizeAccessor,
    nameAccessor,
    seriesName,
    showGrid,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    title,
    subtitle,
    symbolSize,
    tooltipFormatter,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
