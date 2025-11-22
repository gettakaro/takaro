import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { RadialLineChart, RadialLineChartProps } from '.';
import { styled } from '../../../styled';

export default {
  title: 'Charts/RadialLineChart',
  component: RadialLineChart,
  args: {
    animate: true,
  },
  argTypes: {
    animate: { control: 'boolean' },
  },
} as Meta<RadialLineChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

export const Default: StoryFn<RadialLineChartProps<AppleStock>> = (args) => {
  const getDate = (d: AppleStock) => new Date(d.date).valueOf();
  const getStockValue = (d: AppleStock) => d.close;
  const tooltipAccessor = (d: AppleStock) => {
    const date = new Date(d.date).toLocaleDateString();
    return `Date: ${date}\nClose: $${d.close.toFixed(2)}`;
  };

  return (
    <Wrapper>
      <RadialLineChart<AppleStock>
        {...args}
        name="AppleStock"
        xAccessor={getDate}
        yAccessor={getStockValue}
        data={appleStock}
        tooltip={{ accessor: tooltipAccessor }}
      />
    </Wrapper>
  );
};
