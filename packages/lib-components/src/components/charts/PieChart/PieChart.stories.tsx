import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { PieChart, PieChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

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
