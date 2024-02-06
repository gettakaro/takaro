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
    showGrid: true,
    axisXLabel: '',
    axisYLabel: 'Close Price',
  },
} as Meta<AreaChartProps<AppleStock>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
        showBrush={args.showBrush}
        showGrid={args.showGrid}
        axisXLabel={args.axisXLabel}
        axisYLabel={args.axisYLabel}
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
    const timestamp = faker.date.between('2021-01-01T00:00:00Z', '2021-01-31T23:59:59Z').toISOString();
    const latency = faker.datatype.number({ min: 0, max: 70, precision: 1 });
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
        <Header>
          <h2 style={{ marginBottom: '10px' }}>Ping latency</h2>
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
        </Header>
        <div style={{ height: '500px' }}>
          <AreaChart<PingData>
            name="Ping"
            xAccessor={getDate}
            yAccessor={getLatency}
            tooltipAccessor={tooltipAccessor}
            data={generateData()}
            showBrush={false}
          />
        </div>
      </Card>
    </div>
  );
};
