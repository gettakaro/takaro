import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GeoMercator, GeoMercatorProps } from '.';
import { Card } from '../../../components';
import { styled } from '../../../styled';

interface Shape {
  code: string;
  amount: number;
  name: string;
}

const alpha3: Shape[] = [
  { code: 'BEL', amount: 10, name: 'Belgium' },
  { code: 'CAN', amount: 20, name: 'Canada' },
  { code: 'DEU', amount: 30, name: 'Germany' },
  { code: 'ESP', amount: 40, name: 'Spain' },
  { code: 'FRA', amount: 50, name: 'France' },
  { code: 'GBR', amount: 60, name: 'United Kingdom' },
  { code: 'GRC', amount: 70, name: 'Greece' },
  { code: 'ITA', amount: 80, name: 'Italy' },
  { code: 'NLD', amount: 90, name: 'Netherlands' },
  { code: 'USA', amount: 100, name: 'United States of America' },
];

export default {
  title: 'Charts/GeoMercator',
  component: GeoMercator,
  args: {
    showZoomControls: false,
    allowZoomAndDrag: false,
    showCountrySidebar: true,
  },
} as Meta<GeoMercatorProps<Shape>>;

const Wrapper = styled.div`
  width: fit-content;
`;

const Inner = styled.div`
  width: 800px;
  height: 800px;
`;

export const Default: StoryFn<GeoMercatorProps<Shape>> = (args) => {
  const getCountry = (d: Shape) => d.code;
  const getAmount = (d: Shape) => Number(d.amount);
  const tooltipAccessor = (d: Shape) => {
    return `${d.name}:${getAmount(d)}`;
  };

  return (
    <Wrapper>
      <Card>
        <Card.Title label="Map" />
        <Card.Body>
          <Inner>
            <GeoMercator<Shape>
              name="geo-mercator"
              xAccessor={getCountry}
              yAccessor={getAmount}
              tooltipAccessor={tooltipAccessor}
              data={alpha3}
              showZoomControls={args.showZoomControls}
              allowZoomAndDrag={args.allowZoomAndDrag}
              showCountrySidebar={args.showCountrySidebar}
            />
          </Inner>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};
