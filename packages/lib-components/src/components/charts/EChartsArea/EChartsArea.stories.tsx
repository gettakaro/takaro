import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ECharts, EChartsProps } from '../ECharts';
import { styled } from '../../../styled';
import { EChartsOption } from 'echarts';

export default {
  title: 'Charts/ECharts/Area',
  component: ECharts,
} as Meta<EChartsProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
  padding: 20px;
`;

const generateTimeSeriesData = (days: number = 30) => {
  const data = [];
  const baseTime = new Date('2024-01-01').getTime();
  const dayMs = 24 * 3600 * 1000;

  for (let i = 0; i < days; i++) {
    const date = new Date(baseTime + i * dayMs);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50 + i * 2,
    });
  }
  return data;
};

const generateMultiSeriesData = () => {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const series1 = categories.map(() => Math.floor(Math.random() * 100) + 100);
  const series2 = categories.map(() => Math.floor(Math.random() * 80) + 80);
  const series3 = categories.map(() => Math.floor(Math.random() * 60) + 60);
  return { categories, series1, series2, series3 };
};

export const BasicArea: StoryFn<EChartsProps> = () => {
  const data = generateTimeSeriesData();

  const option: EChartsOption = {
    title: {
      text: 'Monthly Growth Trend',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
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
      boundaryGap: false,
      data: data.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
      name: 'Value',
    },
    series: [
      {
        name: 'Growth',
        type: 'line',
        smooth: true,
        data: data.map((item) => item.value),
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
                color: 'rgba(102, 77, 229, 0.6)',
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

export const StackedArea: StoryFn<EChartsProps> = () => {
  const { categories, series1, series2, series3 } = generateMultiSeriesData();

  const option: EChartsOption = {
    title: {
      text: 'Revenue Streams',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Product Sales', 'Services', 'Subscriptions'],
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
      boundaryGap: false,
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Revenue ($k)',
    },
    series: [
      {
        name: 'Product Sales',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
        },
        emphasis: {
          focus: 'series',
        },
        data: series1,
      },
      {
        name: 'Services',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
        },
        emphasis: {
          focus: 'series',
        },
        data: series2,
      },
      {
        name: 'Subscriptions',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
        },
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

export const GradientStackedArea: StoryFn<EChartsProps> = () => {
  const { categories, series1, series2, series3 } = generateMultiSeriesData();

  const option: EChartsOption = {
    title: {
      text: 'Platform Usage Statistics',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['Desktop', 'Mobile', 'Tablet'],
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
      boundaryGap: false,
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Users (k)',
    },
    series: [
      {
        name: 'Desktop',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2,
        },
        showSymbol: false,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 77, 229, 0.8)' },
              { offset: 1, color: 'rgba(102, 77, 229, 0.2)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
        data: series1,
      },
      {
        name: 'Mobile',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2,
        },
        showSymbol: false,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(60, 205, 106, 0.8)' },
              { offset: 1, color: 'rgba(60, 205, 106, 0.2)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
        data: series2,
      },
      {
        name: 'Tablet',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2,
        },
        showSymbol: false,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 124, 0, 0.8)' },
              { offset: 1, color: 'rgba(245, 124, 0, 0.2)' },
            ],
          },
        },
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

export const BandArea: StoryFn<EChartsProps> = () => {
  const days = 30;
  const dates = [];
  const values = [];
  const upper = [];
  const lower = [];

  const baseTime = new Date('2024-01-01').getTime();
  const dayMs = 24 * 3600 * 1000;

  for (let i = 0; i < days; i++) {
    const date = new Date(baseTime + i * dayMs);
    dates.push(date.toISOString().split('T')[0]);
    const baseValue = 100 + Math.sin(i / 5) * 20 + Math.random() * 10;
    values.push(baseValue);
    upper.push(baseValue + 15 + Math.random() * 10);
    lower.push(baseValue - 15 - Math.random() * 10);
  }

  const option: EChartsOption = {
    title: {
      text: 'Confidence Interval',
      subtext: 'With Upper and Lower Bounds',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['Actual', 'L', 'U'],
      selected: {
        L: false,
        U: false,
      },
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
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: 'Value',
    },
    series: [
      {
        name: 'L',
        type: 'line',
        data: lower,
        lineStyle: {
          opacity: 0,
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        name: 'U',
        type: 'line',
        data: upper.map((val, idx) => val - lower[idx]),
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          color: 'rgba(102, 77, 229, 0.2)',
        },
        stack: 'confidence-band',
        symbol: 'none',
      },
      {
        name: 'Actual',
        type: 'line',
        data: values,
        smooth: true,
        lineStyle: {
          width: 2,
        },
        symbol: 'none',
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const PolarArea: StoryFn<EChartsProps> = () => {
  const data = [];
  for (let i = 0; i <= 360; i++) {
    const t = (i / 180) * Math.PI;
    const r = Math.sin(2 * t) * Math.cos(2 * t);
    data.push([r, i]);
  }

  const option: EChartsOption = {
    title: {
      text: 'Polar Area Chart',
      left: 'center',
    },
    polar: {
      center: ['50%', '50%'],
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    angleAxis: {
      type: 'value',
      startAngle: 0,
    },
    radiusAxis: {
      min: 0,
    },
    series: [
      {
        coordinateSystem: 'polar',
        name: 'Area',
        type: 'line',
        showSymbol: false,
        data: data,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 77, 229, 0.8)' },
              { offset: 0.5, color: 'rgba(60, 205, 106, 0.5)' },
              { offset: 1, color: 'rgba(245, 124, 0, 0.3)' },
            ],
          },
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
