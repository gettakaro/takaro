import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { RadialLineChart, RadialLineChartProps } from '.';
import { styled } from '../../../styled';

export default {
  title: 'Charts/RadialLineChart',
  component: RadialLineChart,
} as Meta<RadialLineChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

export const Default: StoryFn<RadialLineChartProps<AppleStock>> = () => {
  const getDate = (d: AppleStock) => new Date(d.date).valueOf();
  const getStockValue = (d: AppleStock) => d.close;

  return (
    <Wrapper>
      <RadialLineChart<AppleStock> name="AppleStock" xAccessor={getDate} yAccessor={getStockValue} data={appleStock} />
    </Wrapper>
  );
};
