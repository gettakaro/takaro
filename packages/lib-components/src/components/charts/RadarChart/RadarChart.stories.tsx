import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { RadarChart, RadarChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

export default {
  title: 'Charts/RadarChart',
  component: RadarChart,
} as Meta<RadarChartProps<LetterFrequency>>;

const Wrapper = styled.div`
  height: 50vh;
  width: 100%;
`;

export const Default: StoryFn<RadarChartProps<LetterFrequency>> = () => {
  const getLetter = (d: LetterFrequency) => d.letter;
  const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency);
  const tooltipAccessor = (d: LetterFrequency) => {
    return `Tooltip content for '${getLetter(d)}' with frequency ${getLetterFrequency(d) * 100}% `;
  };

  // only show the first few letters
  const data = letterFrequency.slice(2, 10);

  return (
    <Wrapper>
      <RadarChart<LetterFrequency>
        name="letterFrequency"
        yAccessor={getLetterFrequency}
        tooltipAccessor={tooltipAccessor}
        data={data}
      />
    </Wrapper>
  );
};
