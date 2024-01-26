import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { RadialChart, RadialChartProps } from '.';
import { styled } from '../../../styled';

export default {
  title: 'Charts/RadialChart',
  component: RadialChart,
} as Meta<RadialChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

export const Default: StoryFn<RadialChartProps<AppleStock>> = () => {
  const getDate = (d: AppleStock) => new Date(d.date).valueOf();
  const getStockValue = (d: AppleStock) => d.close;

  return (
    <Wrapper>
      <RadialChart<AppleStock>
        name="AppleStock"
        xAccessor={getDate}
        yAccessor={getStockValue}
        data={appleStock}
        tooltipAccessor={(d) => `Tooltip content for '${d.close}'`}
      />
    </Wrapper>
  );
};
