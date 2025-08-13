import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ECharts, EChartsProps } from '../ECharts';
import { styled } from '../../../styled';
import { EChartsOption } from 'echarts';

export default {
  title: 'Charts/ECharts/Line',
  component: ECharts,
} as Meta<EChartsProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
  padding: 20px;
`;

// Generate sample data
const generateTimeSeriesData = () => {
  const data = [];
  const baseTime = new Date('2024-01-01').getTime();
  const dayMs = 24 * 3600 * 1000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseTime + i * dayMs);
    data.push([date.toISOString().split('T')[0], Math.floor(Math.random() * 100) + 50]);
  }
  return data;
};

const generateMultiSeriesData = () => {
  const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const series1 = [120, 200, 150, 80, 70, 110, 130];
  const series2 = [90, 180, 120, 100, 90, 130, 110];
  const series3 = [60, 90, 80, 60, 50, 80, 90];

  return { categories, series1, series2, series3 };
};

export const BasicLine: StoryFn<EChartsProps> = () => {
  const data = generateTimeSeriesData();

  const option: EChartsOption = {
    title: {
      text: 'Daily Metrics',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item[0]),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: 'Value',
    },
    series: [
      {
        name: 'Metric',
        type: 'line',
        data: data.map((item) => item[1]),
        smooth: true,
        emphasis: {
          focus: 'series',
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

export const MultipleLines: StoryFn<EChartsProps> = () => {
  const { categories, series1, series2, series3 } = generateMultiSeriesData();

  const option: EChartsOption = {
    title: {
      text: 'Weekly Performance Comparison',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['Product A', 'Product B', 'Product C'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Sales',
    },
    series: [
      {
        name: 'Product A',
        type: 'line',
        data: series1,
        smooth: true,
      },
      {
        name: 'Product B',
        type: 'line',
        data: series2,
        smooth: true,
      },
      {
        name: 'Product C',
        type: 'line',
        data: series3,
        smooth: true,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const AreaLine: StoryFn<EChartsProps> = () => {
  const data = generateTimeSeriesData();

  const option: EChartsOption = {
    title: {
      text: 'Area Chart with Gradient',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item[0]),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: 'Value',
    },
    series: [
      {
        name: 'Metric',
        type: 'line',
        data: data.map((item) => item[1]),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(102, 77, 229, 0.5)',
              },
              {
                offset: 1,
                color: 'rgba(102, 77, 229, 0.05)',
              },
            ],
          },
        },
        emphasis: {
          focus: 'series',
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

export const StepLine: StoryFn<EChartsProps> = () => {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [120, 120, 150, 150, 200, 200];

  const option: EChartsOption = {
    title: {
      text: 'Step Line Chart',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Price ($)',
    },
    series: [
      {
        name: 'Pricing Tier',
        type: 'line',
        step: 'end',
        data: data,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const WithDataZoom: StoryFn<EChartsProps> = () => {
  const data = [];
  const baseTime = new Date('2023-01-01').getTime();
  const dayMs = 24 * 3600 * 1000;

  for (let i = 0; i < 365; i++) {
    const date = new Date(baseTime + i * dayMs);
    data.push([date.toISOString().split('T')[0], Math.floor(Math.random() * 1000) + 500]);
  }

  const option: EChartsOption = {
    title: {
      text: 'Yearly Data with Zoom',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item[0]),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: 'Value',
    },
    dataZoom: [
      {
        type: 'slider',
        start: 70,
        end: 100,
      },
      {
        type: 'inside',
        start: 70,
        end: 100,
      },
    ],
    series: [
      {
        name: 'Daily Value',
        type: 'line',
        data: data.map((item) => item[1]),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 1.5,
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
