import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsLine, EChartsLineProps } from './EChartsLine';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/Line',
  component: EChartsLine,
  args: {
    smooth: true,
    area: false,
    showGrid: true,
    showLegend: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'Value',
    title: 'Line Chart Example',
    subtitle: 'Sample data visualization',
  },
} as Meta<EChartsLineProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface TimeSeriesData {
  date: string;
  value: number;
}

// Generate sample time series data
function generateTimeSeriesData(days: number = 30): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString(),
      value: faker.number.int({ min: 100, max: 500 }) + Math.sin(i / 5) * 50,
    });
  }

  return data;
}

export const Default: StoryFn<EChartsLineProps<TimeSeriesData>> = (args) => {
  const data = generateTimeSeriesData();

  return (
    <Wrapper>
      <EChartsLine<TimeSeriesData>
        {...args}
        data={data}
        xAccessor={(d) => d.date}
        yAccessor={(d) => d.value}
        seriesName="Daily Value"
      />
    </Wrapper>
  );
};

export const AreaChart: StoryFn<EChartsLineProps<TimeSeriesData>> = (args) => {
  const data = generateTimeSeriesData();

  return (
    <Wrapper>
      <EChartsLine<TimeSeriesData>
        {...args}
        data={data}
        xAccessor={(d) => d.date}
        yAccessor={(d) => d.value}
        seriesName="Daily Revenue"
        area={true}
        title="Revenue Over Time"
        subtitle="Last 30 days"
      />
    </Wrapper>
  );
};

export const MultipleLines: StoryFn = () => {
  const data = generateTimeSeriesData();

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Server Performance Metrics" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsLine
              data={data}
              xAccessor={(d) => d.date}
              yAccessor={(d) => d.value}
              seriesName="CPU Usage"
              smooth={true}
              showGrid={true}
              xAxisLabel="Date"
              yAxisLabel="Usage (%)"
              tooltipFormatter={(params: any) => {
                return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value}%`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const SteppedLine: StoryFn<EChartsLineProps<TimeSeriesData>> = (args) => {
  const data = generateTimeSeriesData(20);

  return (
    <Wrapper>
      <EChartsLine<TimeSeriesData>
        {...args}
        data={data}
        xAccessor={(d) => d.date}
        yAccessor={(d) => d.value}
        seriesName="Player Count"
        smooth={false}
        title="Players Online"
        subtitle="Real-time monitoring"
      />
    </Wrapper>
  );
};
