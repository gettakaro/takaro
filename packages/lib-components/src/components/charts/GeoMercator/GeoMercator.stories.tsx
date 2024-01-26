import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GeoMercator, GeoMercatorProps } from '.';
import { styled } from '../../../styled';

interface Shape {
  country: string;
  amount: number;
}

const data: Shape[] = [
  { country: 'BE', amount: 10 },
  { country: 'DE', amount: 20 },
  { country: 'FR', amount: 30 },
  { country: 'NL', amount: 40 },
  { country: 'UK', amount: 50 },
  { country: 'US', amount: 60 },
];

export default {
  title: 'Charts/GeoMercator',
  component: GeoMercator,
} as Meta<GeoMercatorProps<Shape>>;

const Wrapper = styled.div`
  height: 800px;
  width: 800px;
`;

export const Default: StoryFn<GeoMercatorProps<Shape>> = () => {
  const getCountry = (d: Shape) => d.country;
  const getAmount = (d: Shape) => Number(d.amount);
  const tooltipAccessor = (d: Shape) => {
    return `Tooltip content for '${getCountry(d)}' with amount ${getAmount(d)}`;
  };

  return (
    <Wrapper>
      <GeoMercator<Shape>
        name="geo-mercator"
        xAccessor={getCountry}
        yAccessor={getAmount}
        tooltipAccessor={tooltipAccessor}
        data={data}
      />
    </Wrapper>
  );
};
