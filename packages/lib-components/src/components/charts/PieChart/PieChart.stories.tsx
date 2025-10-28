import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { PieChart, PieChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';
import { Card } from '../../visual/Card';

export default {
  title: 'Charts/PieChart',
  component: PieChart,
  args: {
    innerRadius: 0,
    padAngle: 0.005,
    cornerRadius: 0,
    legendPosition: 'none',
    labelPosition: 'inside',
    animate: true,
  },
  argTypes: {
    cornerRadius: {
      description:
        'Note: Set to 0 when using small innerRadius (<0.3) with large padAngle (>0.02) to keep slices consistent',
    },
  },
} as Meta<PieChartProps<LetterFrequency>>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

const getLetter = (d: LetterFrequency) => d.letter;
const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

// Limit data to first 6 items for better visualization
const limitedData = letterFrequency.slice(0, 6);

export const Default: StoryFn<PieChartProps<LetterFrequency>> = (args) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: '16px', minHeight: '24px' }}>
        {selectedLetter && (
          <p>
            Selected: <strong>{selectedLetter}</strong>
          </p>
        )}
      </div>
      <Wrapper>
        <PieChart<LetterFrequency>
          {...args}
          name="default-pie"
          xAccessor={getLetter}
          yAccessor={getLetterFrequency}
          data={limitedData}
          onSliceClick={(d) => setSelectedLetter(getLetter(d))}
        />
      </Wrapper>
    </div>
  );
};

// User Distribution Card Story
interface UserType {
  role: string;
  count: number;
}

const userData: UserType[] = [
  { role: 'Free', count: 8200 },
  { role: 'Premium', count: 3500 },
  { role: 'Moderator', count: 1200 },
  { role: 'Admin', count: 150 },
];

const CardWrapper = styled.div`
  width: 600px;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 600px;
`;

const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TotalCount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const TotalLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textAlt};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const UserDistributionCard: StoryFn = () => {
  const userColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  const total = userData.reduce((sum, d) => sum + d.count, 0);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <CardWrapper>
      <Card>
        <Card.Title label="User Distribution" />
        <Card.Body>
          <ChartContainer>
            <PieChart<UserType>
              name="user-distribution-pie"
              data={userData}
              xAccessor={(d) => d.role}
              yAccessor={(d) => d.count}
              innerRadius={0.6}
              labelPosition="inside"
              legendPosition="left"
              colors={userColors}
              cornerRadius={3}
              padAngle={0.02}
              tooltip={{
                accessor: (d) => {
                  const percentage = ((d.count / total) * 100).toFixed(1);
                  return `${d.role}: ${formatNumber(d.count)} users (${percentage}%)`;
                },
              }}
              centerContent={(totalValue) => (
                <CenterContent>
                  <TotalCount>{formatNumber(totalValue)}</TotalCount>
                  <TotalLabel>Total Users</TotalLabel>
                </CenterContent>
              )}
            />
          </ChartContainer>
        </Card.Body>
      </Card>
    </CardWrapper>
  );
};
