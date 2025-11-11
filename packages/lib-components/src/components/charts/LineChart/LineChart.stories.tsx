import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { LineChart, LineChartProps } from '.';
import { styled } from '../../../styled';
import * as allCurves from '@visx/curve';

export default {
  title: 'Charts/LineChart',
  component: LineChart,
  args: {
    curveType: 'curveBasis',
    grid: 'none',
    showAxisX: false,
    showAxisY: false,
    axisXLabel: 'Date',
    axisYLabel: 'Stock Price',
    numTicksX: undefined,
    numTicksY: undefined,
    showTooltip: true,
  },
  argTypes: {
    curveType: {
      control: 'select',
      options: [...Object.keys(allCurves)],
    },
    grid: {
      control: 'select',
      options: ['none', 'x', 'y', 'xy'],
      description: 'Display grid lines',
    },
    showAxisX: { control: 'boolean' },
    showAxisY: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    color: { control: 'color' },
    numTicksX: { control: { type: 'number', min: 1, max: 20, step: 1 } },
    numTicksY: { control: { type: 'number', min: 1, max: 20, step: 1 } },
  },
} as Meta<LineChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

export const Default: StoryFn<LineChartProps<AppleStock>> = (args) => {
  const getDate = (d: AppleStock) => new Date(d.date);
  const getStockValue = (d: AppleStock) => d.close;
  const getTooltip = (d: AppleStock) => `Close: ${d.close}`;

  return (
    <Wrapper>
      <LineChart<AppleStock>
        {...args}
        name="AppleStock"
        xAccessor={getDate}
        data={appleStock}
        lines={[
          {
            id: 'close',
            yAccessor: getStockValue,
            tooltipAccessor: getTooltip,
            color: '#664de5',
          },
        ]}
      />
    </Wrapper>
  );
};

export const MultipleLines: StoryFn<LineChartProps<AppleStock>> = (args) => {
  const getDate = (d: AppleStock) => new Date(d.date);

  const lineConfigs = [
    {
      id: 'close',
      yAccessor: (d: AppleStock) => d.close,
      color: '#664de5',
      label: 'Close',
      tooltipAccessor: (d: AppleStock) => `Close: $${d.close.toFixed(2)}`,
    },
    {
      id: 'high-estimate',
      yAccessor: (d: AppleStock) => d.close * 1.1,
      color: '#32CD32',
      label: 'High (+10%)',
      tooltipAccessor: (d: AppleStock) => `High: $${(d.close * 1.1).toFixed(2)}`,
    },
    {
      id: 'low-estimate',
      yAccessor: (d: AppleStock) => d.close * 0.9,
      color: '#FF6347',
      label: 'Low (-10%)',
      tooltipAccessor: (d: AppleStock) => `Low: $${(d.close * 0.9).toFixed(2)}`,
    },
  ];

  return (
    <Wrapper>
      <LineChart<AppleStock>
        {...args}
        name="AppleStockMultiLine"
        xAccessor={getDate}
        data={appleStock}
        lines={lineConfigs}
        axisYLabel="Stock Price ($)"
        axisXLabel="Date"
      />
    </Wrapper>
  );
};
