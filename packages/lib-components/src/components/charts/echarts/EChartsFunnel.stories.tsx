import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsFunnel, EChartsFunnelProps } from './EChartsFunnel';
import { styled } from '../../../styled';
import { Card } from '../../../components';

export default {
  title: 'Charts/ECharts/Funnel',
  component: EChartsFunnel,
  args: {
    showLegend: true,
    showLabel: true,
    sort: 'descending',
    title: 'Funnel Chart',
    gap: 2,
  },
} as Meta<EChartsFunnelProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface FunnelData {
  stage: string;
  count: number;
}

// Generate sample funnel data
function generateFunnelData(): FunnelData[] {
  return [
    { stage: 'Visits', count: 1000 },
    { stage: 'Registrations', count: 650 },
    { stage: 'First Purchase', count: 400 },
    { stage: 'Repeat Purchase', count: 250 },
    { stage: 'VIP Status', count: 100 },
  ];
}

export const Default: StoryFn<EChartsFunnelProps<FunnelData>> = (args) => {
  const data = generateFunnelData();

  return (
    <Wrapper>
      <EChartsFunnel<FunnelData>
        {...args}
        data={data}
        nameAccessor={(d) => d.stage}
        valueAccessor={(d) => d.count}
        seriesName="Conversion"
      />
    </Wrapper>
  );
};

export const PlayerConversion: StoryFn = () => {
  const conversionData = [
    { stage: 'New Players', count: 5000 },
    { stage: 'Tutorial Completed', count: 3500 },
    { stage: 'First Mission', count: 2800 },
    { stage: 'Level 10 Reached', count: 1800 },
    { stage: 'First Purchase', count: 900 },
    { stage: 'Regular Player', count: 450 },
  ];

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Player Conversion Funnel" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsFunnel
              data={conversionData}
              nameAccessor={(d) => d.stage}
              valueAccessor={(d) => d.count}
              seriesName="Players"
              showLegend={false}
              labelPosition="inside"
              tooltipFormatter={(params: any) => {
                return `${params.name}<br/>Players: ${params.value.toLocaleString()} (${params.percent}%)`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const SalesProcess: StoryFn<EChartsFunnelProps<FunnelData>> = (args) => {
  const salesData = [
    { stage: 'Leads', count: 100 },
    { stage: 'Qualified', count: 80 },
    { stage: 'Proposal', count: 60 },
    { stage: 'Negotiation', count: 40 },
    { stage: 'Closed', count: 30 },
  ];

  return (
    <Wrapper>
      <EChartsFunnel<FunnelData>
        {...args}
        data={salesData}
        nameAccessor={(d) => d.stage}
        valueAccessor={(d) => d.count}
        seriesName="Sales"
        title="Sales Pipeline"
        subtitle="Q4 2024"
        labelPosition="right"
      />
    </Wrapper>
  );
};

export const AscendingFunnel: StoryFn<EChartsFunnelProps<FunnelData>> = (args) => {
  const growthData = [
    { stage: 'Bronze', count: 30 },
    { stage: 'Silver', count: 50 },
    { stage: 'Gold', count: 75 },
    { stage: 'Platinum', count: 90 },
    { stage: 'Diamond', count: 100 },
  ];

  return (
    <Wrapper>
      <EChartsFunnel<FunnelData>
        {...args}
        data={growthData}
        nameAccessor={(d) => d.stage}
        valueAccessor={(d) => d.count}
        seriesName="Tier Distribution"
        sort="ascending"
        title="Player Tier Progression"
        subtitle="Inverted funnel showing growth"
        gap={5}
      />
    </Wrapper>
  );
};

export const NoSort: StoryFn<EChartsFunnelProps<FunnelData>> = (args) => {
  const customData = [
    { stage: 'Start', count: 80 },
    { stage: 'Middle', count: 100 },
    { stage: 'Peak', count: 120 },
    { stage: 'Decline', count: 60 },
    { stage: 'End', count: 40 },
  ];

  return (
    <Wrapper>
      <EChartsFunnel<FunnelData>
        {...args}
        data={customData}
        nameAccessor={(d) => d.stage}
        valueAccessor={(d) => d.count}
        seriesName="Custom Flow"
        sort="none"
        title="Custom Process Flow"
        subtitle="Maintains data order"
      />
    </Wrapper>
  );
};
