import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { DatePicker, DatePickerProps } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export default {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  args: {
    readOnly: false,
    hasDescription: false,
    hasError: false,
  },
} as Meta<DatePickerProps>;

export const Default: StoryFn<DatePickerProps> = (args) => {
  return (
    <Wrapper>
      <DatePicker
        readOnly={args.readOnly}
        hasDescription={args.hasDescription}
        hasError={args.hasError}
        id="date"
        onChange={(start, end) => console.log(start, end)}
        value="2021-01-01"
      />
    </Wrapper>
  );
};
