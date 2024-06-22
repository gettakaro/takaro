import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GenericDateRangePicker, GenericDateRangePickerProps } from './Generic';
import { styled } from '../../../../styled';

const Wrapper = styled.div`
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export default {
  title: 'Inputs/DateRangePicker',
  component: GenericDateRangePicker,
  args: {
    readOnly: false,
    hasDescription: false,
    hasError: false,
  },
} as Meta<GenericDateRangePickerProps>;

export const Default: StoryFn<GenericDateRangePickerProps> = (args) => {
  const handleOnChange = () => {};

  return (
    <Wrapper>
      <GenericDateRangePicker
        hasDescription={args.hasDescription}
        hasError={args.hasError}
        name="daterangepicker"
        readOnly={args.readOnly}
        id="date"
        onChange={handleOnChange}
        value="2021-01-01"
      />
    </Wrapper>
  );
};
