import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { LineChart, LineChartProps } from '.';
import { styled } from '../../../styled';

export default {
  title: 'Charts/LineChart',
  component: LineChart,
  args: {
    curveType: 'curveBasis',
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
        name="AppleStock"
        xAccessor={getDate}
        yAccessor={getStockValue}
        tooltipAccessor={getTooltip}
        data={appleStock}
        curveType={args.curveType}
      />
    </Wrapper>
  );
};
