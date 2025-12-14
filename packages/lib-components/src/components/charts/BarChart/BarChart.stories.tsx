import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { BarChart, BarChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

const Wrapper = styled.div`
  height: 50vh;
  width: 100%;
`;

const getLetter = (d: LetterFrequency) => d.letter;
const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

export default {
  title: 'Charts/BarChart',
  component: BarChart,
  args: {
    name: 'letterFrequency',
    grid: 'xy',
    barWidth: 0.6,
    tooltip: {
      enabled: true,
      accessor: (d: LetterFrequency) => `${d.letter}: ${getLetterFrequency(d).toFixed(1)}%`,
    },
    brush: {
      enabled: false,
    },
    axis: {
      showX: true,
      showY: true,
      labelX: 'Letter',
      labelY: 'Frequency (%)',
    },
  },
  argTypes: {
    barWidth: {
      control: { type: 'range', min: 0.1, max: 1, step: 0.05 },
      description: 'Bar width as percentage (0-1). 1.0 = bars touch (no gaps)',
    },
  },
} as Meta<BarChartProps<LetterFrequency>>;

export const Default: StoryFn<BarChartProps<LetterFrequency>> = (args) => {
  return (
    <Wrapper>
      <BarChart<LetterFrequency>
        {...args}
        xAccessor={getLetter}
        yAccessor={getLetterFrequency}
        data={letterFrequency}
      />
    </Wrapper>
  );
};
