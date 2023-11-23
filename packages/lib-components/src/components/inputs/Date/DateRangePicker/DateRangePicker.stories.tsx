import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { DateRangePicker, DateRangePickerProps } from '.';
import { styled } from '../../../../styled';

const Wrapper = styled.div`
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export default {
  title: 'Inputs/DateRangePicker',
  component: DateRangePicker,
  args: {
    readOnly: false,
    hasDescription: false,
    hasError: false,
  },
} as Meta<DateRangePickerProps>;

export const Default: StoryFn<DateRangePickerProps> = (args) => {
  return (
    <Wrapper>
      <DateRangePicker
        readOnly={args.readOnly}
        id="date"
        onChange={(start, end) => console.log(start, end)}
        value="2021-01-01"
      />
    </Wrapper>
  );
};
