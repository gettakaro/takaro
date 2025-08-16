import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsScatter, EChartsScatterProps } from './EChartsScatter';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/Scatter',
  component: EChartsScatter,
  args: {
    showGrid: true,
    showLegend: false,
    xAxisLabel: 'X Axis',
    yAxisLabel: 'Y Axis',
    title: 'Scatter Plot',
    symbolSize: 10,
  },
} as Meta<EChartsScatterProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface ScatterData {
  x: number;
  y: number;
  size?: number;
  name?: string;
}

// Generate sample scatter data
function generateScatterData(count: number = 50): ScatterData[] {
  const data: ScatterData[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      x: faker.number.int({ min: 0, max: 100 }),
      y: faker.number.int({ min: 0, max: 100 }),
      size: faker.number.int({ min: 5, max: 50 }),
      name: `Point ${i + 1}`,
    });
  }

  return data;
}

export const Default: StoryFn<EChartsScatterProps<ScatterData>> = (args) => {
  const data = generateScatterData();

  return (
    <Wrapper>
      <EChartsScatter<ScatterData>
        {...args}
        data={data}
        xAccessor={(d) => d.x}
        yAccessor={(d) => d.y}
        seriesName="Data Points"
      />
    </Wrapper>
  );
};

export const BubbleChart: StoryFn<EChartsScatterProps<ScatterData>> = (args) => {
  const data = generateScatterData(30);

  return (
    <Wrapper>
      <EChartsScatter<ScatterData>
        {...args}
        data={data}
        xAccessor={(d) => d.x}
        yAccessor={(d) => d.y}
        sizeAccessor={(d) => d.size || 10}
        nameAccessor={(d) => d.name}
        seriesName="Bubble Data"
        title="Bubble Chart"
        subtitle="Size represents third dimension"
      />
    </Wrapper>
  );
};

export const PlayerAnalysis: StoryFn = () => {
  // Generate player data with correlation
  const players = Array.from({ length: 40 }, (_, i) => {
    const playtime = faker.number.int({ min: 10, max: 200 });
    const purchases = Math.floor(playtime * 0.3 + faker.number.int({ min: -10, max: 20 }));
    const level = Math.floor(playtime * 0.5 + faker.number.int({ min: 0, max: 10 }));

    return {
      playtime,
      purchases,
      level,
      name: `Player${i + 1}`,
    };
  });

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Player Behavior Analysis" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsScatter
              data={players}
              xAccessor={(d) => d.playtime}
              yAccessor={(d) => d.purchases}
              sizeAccessor={(d) => d.level}
              nameAccessor={(d) => d.name}
              seriesName="Players"
              xAxisLabel="Playtime (hours)"
              yAxisLabel="Total Purchases"
              showGrid={true}
              tooltipFormatter={(params: any) => {
                const value = params.value || params.data.value;
                return `${params.data.name}<br/>
                        Playtime: ${value[0]} hours<br/>
                        Purchases: ${value[1]}<br/>
                        Level: ${value[2]}`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const Clustering: StoryFn<EChartsScatterProps<ScatterData>> = (args) => {
  // Generate clustered data
  const clusters = [
    { cx: 25, cy: 25, spread: 10 },
    { cx: 75, cy: 75, spread: 10 },
    { cx: 25, cy: 75, spread: 8 },
    { cx: 75, cy: 25, spread: 12 },
  ];

  const data: ScatterData[] = [];
  clusters.forEach((cluster, clusterIndex) => {
    for (let i = 0; i < 15; i++) {
      data.push({
        x: cluster.cx + faker.number.int({ min: -cluster.spread, max: cluster.spread }),
        y: cluster.cy + faker.number.int({ min: -cluster.spread, max: cluster.spread }),
        name: `Cluster ${clusterIndex + 1}`,
      });
    }
  });

  return (
    <Wrapper>
      <EChartsScatter<ScatterData>
        {...args}
        data={data}
        xAccessor={(d) => d.x}
        yAccessor={(d) => d.y}
        nameAccessor={(d) => d.name}
        seriesName="Clusters"
        title="Data Clustering"
        subtitle="Four distinct groups"
        symbolSize={8}
      />
    </Wrapper>
  );
};
