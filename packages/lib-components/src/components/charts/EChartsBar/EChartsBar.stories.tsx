import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ECharts, EChartsProps } from '../ECharts';
import { styled } from '../../../styled';
import { EChartsOption } from 'echarts';

export default {
  title: 'Charts/ECharts/Bar',
  component: ECharts,
} as Meta<EChartsProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
  padding: 20px;
`;

const generateBarData = () => {
  const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = categories.map(() => Math.floor(Math.random() * 300) + 50);
  return { categories, data };
};

const generateMultiSeriesBarData = () => {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const series1 = [120, 200, 150, 80, 70, 110];
  const series2 = [90, 180, 120, 100, 90, 130];
  const series3 = [60, 90, 80, 60, 50, 80];
  return { categories, series1, series2, series3 };
};

export const BasicBar: StoryFn<EChartsProps> = () => {
  const { categories, data } = generateBarData();

  const option: EChartsOption = {
    title: {
      text: 'Weekly Sales',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Sales ($)',
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: data,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const HorizontalBar: StoryFn<EChartsProps> = () => {
  const categories = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const data = [320, 302, 301, 334, 390];

  const option: EChartsOption = {
    title: {
      text: 'Product Performance',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Units Sold',
    },
    yAxis: {
      type: 'category',
      data: categories,
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: data,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const StackedBar: StoryFn<EChartsProps> = () => {
  const { categories, series1, series2, series3 } = generateMultiSeriesBarData();

  const option: EChartsOption = {
    title: {
      text: 'Monthly Revenue by Product',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Product A', 'Product B', 'Product C'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Revenue (k$)',
    },
    series: [
      {
        name: 'Product A',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: series1,
      },
      {
        name: 'Product B',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: series2,
      },
      {
        name: 'Product C',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: series3,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const GroupedBar: StoryFn<EChartsProps> = () => {
  const { categories, series1, series2, series3 } = generateMultiSeriesBarData();

  const option: EChartsOption = {
    title: {
      text: 'Quarterly Comparison',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Q1', 'Q2', 'Q3'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Value',
    },
    series: [
      {
        name: 'Q1',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        data: series1,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Q2',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        data: series2,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Q3',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        data: series3,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const WaterfallBar: StoryFn<EChartsProps> = () => {
  const categories = ['Start', 'Revenue', 'Costs', 'Tax', 'Other', 'End'];
  const increaseData = [0, 900, 0, 0, 300, 0];
  const decreaseData = [0, 0, -600, -200, 0, 0];
  const totalData = [500, 0, 0, 0, 0, 900];

  const option: EChartsOption = {
    title: {
      text: 'Profit Waterfall',
      subtext: 'Financial Analysis',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const tar = params[0];
        return `${tar.name}<br/>${tar.seriesName}: ${Math.abs(tar.value)}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Amount ($k)',
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        silent: true,
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent',
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
        },
        data: [0, 500, 800, 600, 400, 0],
      },
      {
        name: 'Increase',
        type: 'bar',
        stack: 'Total',
        data: increaseData,
        itemStyle: {
          color: '#3ccd6a',
        },
      },
      {
        name: 'Decrease',
        type: 'bar',
        stack: 'Total',
        data: decreaseData,
        itemStyle: {
          color: '#ff4252',
        },
      },
      {
        name: 'Total',
        type: 'bar',
        stack: 'Total',
        data: totalData,
        itemStyle: {
          color: '#664de5',
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const PolarBar: StoryFn<EChartsProps> = () => {
  const data = [
    { value: 100, name: 'Mon' },
    { value: 120, name: 'Tue' },
    { value: 90, name: 'Wed' },
    { value: 150, name: 'Thu' },
    { value: 130, name: 'Fri' },
    { value: 110, name: 'Sat' },
    { value: 80, name: 'Sun' },
  ];

  const option: EChartsOption = {
    title: {
      text: 'Weekly Activity',
      left: 'center',
    },
    angleAxis: {
      type: 'category',
      data: data.map((item) => item.name),
    },
    radiusAxis: {},
    polar: {},
    series: [
      {
        type: 'bar',
        data: data.map((item) => item.value),
        coordinateSystem: 'polar',
      },
    ],
    tooltip: {},
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};
