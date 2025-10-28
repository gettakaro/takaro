import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { RadarChart, RadarChartProps } from '.';
import { styled } from '../../../styled';
import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';

export default {
  title: 'Charts/RadarChart',
  component: RadarChart,
  args: {
    levels: 5,
    items: 6,
    animate: true,
  },
} as Meta<RadarChartProps<LetterFrequency>>;

const Wrapper = styled.div`
  height: 200px;
  width: 200px;
`;

export const Default: StoryFn<RadarChartProps<LetterFrequency>> = (args) => {
  const getLetter = (d: LetterFrequency) => d.letter;
  const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency);
  const tooltipAccessor = (d: LetterFrequency) => {
    return `Tooltip content for '${getLetter(d)}' with frequency ${getLetterFrequency(d) * 100}% `;
  };

  // only show the first few letters
  const data = letterFrequency.slice(0, (args as any).items);

  return (
    <Wrapper>
      <RadarChart<LetterFrequency>
        name="letterFrequency"
        yAccessor={getLetterFrequency}
        xAccessor={getLetter}
        tooltipAccessor={tooltipAccessor}
        data={data}
        levels={args.levels}
        animate={args.animate}
      />
    </Wrapper>
  );
};
