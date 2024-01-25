import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { AreaChart, AreaChartProps } from '.';
import { styled } from '../../../styled';
import { bisector } from '@visx/vendor/d3-array';

export default {
  title: 'Charts/AreaChart',
  component: AreaChart,
  args: {
    showBrush: true,
    showGrid: true,
    axisXLabel: 'Date',
    axisYLabel: 'Close Price',
    unit: '$',
  },
} as Meta<AreaChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 80vh;
  width: 100%;
`;

export const Default: StoryFn<AreaChartProps<AppleStock>> = (args) => {
  const getDate = (d: AppleStock) => new Date(d.date);
  const getStockValue = (d: AppleStock) => d.close;
  const bisectDate = bisector<AppleStock, Date>((d) => new Date(d.date)).left;

  return (
    <Wrapper>
      <AreaChart<AppleStock>
        name="AppleStock"
        xAccessor={getDate}
        yAccessor={getStockValue}
        data={appleStock}
        xBisector={bisectDate}
        showBrush={args.showBrush}
        showGrid={args.showGrid}
        axisXLabel={args.axisXLabel}
        axisYLabel={args.axisYLabel}
        unit={args.unit}
      />
    </Wrapper>
  );
};
