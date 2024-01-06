import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { TimePicker, TimePickerProps } from '.';
import { DateTime } from 'luxon';

export default {
  title: 'Inputs/TimePicker',
  component: TimePicker,
  args: {
    readOnly: false,
    hasDescription: false,
    hasError: false,
  },
} as Meta<TimePickerProps>;

export const Default: StoryFn<TimePickerProps> = () => {
  const [selectedTime, setSelectedTime] = React.useState<DateTime>(DateTime.local().startOf('day'));

  return (
    <>
      timepicker should not be used separately, instead use datepicker and select a time format
      <TimePicker selectedDate={selectedTime} onChange={(newTime) => setSelectedTime(newTime)} />
    </>
  );
};
