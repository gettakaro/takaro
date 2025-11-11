import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { AreaChart, AreaChartProps } from '.';
import { styled } from '../../../styled';
import { Card, Dropdown, IconButton } from '../../../components';
import { faker } from '@faker-js/faker';
import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';

export default {
  title: 'Charts/AreaChart',
  component: AreaChart,
  args: {
    showBrush: true,
    axisXLabel: '',
    axisYLabel: 'Close Price',
    grid: 'none',
    animate: true,
  },
} as Meta<AreaChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

export const Default: StoryFn<AreaChartProps<AppleStock>> = (args) => {
  const getDate = (d: AppleStock) => new Date(d.date);
  const getStockValue = (d: AppleStock) => d.close;
  return (
    <Wrapper>
      <AreaChart<AppleStock>
        name="AppleStock"
        xAccessor={getDate}
        yAccessor={getStockValue}
        data={appleStock}
        axis={{
          labelX: args.axis?.labelX,
          labelY: args.axis?.labelY,
        }}
        grid={args.grid}
        animate={args.animate}
      />
    </Wrapper>
  );
};

interface PingData {
  timestamp: string;
  latency: number;
}

function generateData() {
  const data: PingData[] = [];
  for (let i = 0; i < 100; i++) {
    const timestamp = faker.date.between({ from: '2021-01-01T00:00:00Z', to: '2021-01-31T23:59:59Z' }).toISOString();
    const latency = faker.number.float({ min: 0, max: 70, fractionDigits: 1 });
    data.push({ timestamp, latency });
  }
  data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return data;
}

export const PingExample: StoryFn = () => {
  const getDate = (d: PingData) => new Date(d.timestamp);
  const getLatency = (d: PingData) => d.latency;

  const tooltipAccessor = (d: PingData) => {
    return `${d.latency}ms`;
  };

  return (
    <div style={{ width: 800, height: 300 }}>
      <Card variant="outline">
        <Card.Title label="Ping latency">
          <Dropdown>
            <Dropdown.Trigger asChild>
              <IconButton icon={<MenuIcon />} ariaLabel="open menu" />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Menu.Item onClick={() => {}} label="Option 1" />
              <Dropdown.Menu.Item onClick={() => {}} label="Option 2" />
              <Dropdown.Menu.Item onClick={() => {}} label="Option 3" />
            </Dropdown.Menu>
          </Dropdown>
        </Card.Title>
        <Card.Body>
          <div style={{ height: '500px' }}>
            <AreaChart<PingData>
              name="Ping"
              xAccessor={getDate}
              yAccessor={getLatency}
              tooltip={{
                accessor: tooltipAccessor,
              }}
              data={generateData()}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
