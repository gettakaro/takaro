import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { PieChart, PieChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

export default {
  title: 'Charts/PieChart',
  component: PieChart,
  args: {
    variant: 'pie',
  },
} as Meta<PieChartProps<LetterFrequency>>;

const Wrapper = styled.div`
  height: 50vh;
  width: 100%;
`;

export const Default: StoryFn<PieChartProps<LetterFrequency>> = (args) => {
  const getLetter = (d: LetterFrequency) => d.letter;
  const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

  const tooltipAccessor = (d: LetterFrequency) => {
    return `Tooltip content for '${getLetter(d)}' with frequency ${getLetterFrequency(d)}`;
  };

  const first_5_letters_with_frequency = letterFrequency.slice(0, 5);
  return (
    <Wrapper>
      <PieChart<LetterFrequency>
        name="letterFrequency"
        xAccessor={getLetter}
        yAccessor={getLetterFrequency}
        tooltipAccessor={tooltipAccessor}
        data={first_5_letters_with_frequency}
        variant={args.variant}
      />
    </Wrapper>
  );
};
