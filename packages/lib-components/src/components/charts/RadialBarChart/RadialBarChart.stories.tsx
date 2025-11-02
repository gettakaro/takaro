import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { RadialBarChart, RadialBarChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

export default {
  title: 'Charts/RadialBarChart',
  component: RadialBarChart,
} as Meta<RadialBarChartProps<LetterFrequency>>;

const Wrapper = styled.div`
  height: 500px;
  width: 500px;
`;

export const Default: StoryFn<RadialBarChartProps<LetterFrequency>> = () => {
  const getLetter = (d: LetterFrequency) => d.letter;
  const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;
  const alphabeticalSort = (a: LetterFrequency, b: LetterFrequency) => a.letter.localeCompare(b.letter);
  const data = letterFrequency.sort(alphabeticalSort);

  return (
    <Wrapper>
      <RadialBarChart<LetterFrequency>
        name="LetterFrequency"
        xAccessor={getLetter}
        yAccessor={getLetterFrequency}
        data={data}
        tooltipAccessor={(d) => `Tooltip content for '${d.frequency}'`}
        animate={true}
      />
    </Wrapper>
  );
};

export const WithoutAnimation: StoryFn<RadialBarChartProps<LetterFrequency>> = () => {
  const getLetter = (d: LetterFrequency) => d.letter;
  const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;
  const alphabeticalSort = (a: LetterFrequency, b: LetterFrequency) => a.letter.localeCompare(b.letter);
  const data = letterFrequency.sort(alphabeticalSort);

  return (
    <Wrapper>
      <RadialBarChart<LetterFrequency>
        name="LetterFrequency"
        xAccessor={getLetter}
        yAccessor={getLetterFrequency}
        data={data}
        tooltipAccessor={(d) => `Tooltip content for '${d.frequency}'`}
        animate={false}
      />
    </Wrapper>
  );
};
