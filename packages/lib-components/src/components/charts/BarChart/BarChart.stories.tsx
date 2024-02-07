import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { BarChart, BarChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

export default {
  title: 'Charts/BarChart',
  component: BarChart,
} as Meta<BarChartProps<LetterFrequency>>;

const Wrapper = styled.div`
  height: 50vh;
  width: 100%;
`;

export const Default: StoryFn<BarChartProps<LetterFrequency>> = () => {
  const getLetter = (d: LetterFrequency) => d.letter;
  const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

  return (
    <Wrapper>
      <BarChart<LetterFrequency>
        name="letterFrequency"
        xAccessor={getLetter}
        yAccessor={getLetterFrequency}
        data={letterFrequency}
        showBrush={true}
      />
    </Wrapper>
  );
};
