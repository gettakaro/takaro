// TODO: save images locally so when there is no network they are still loaded.
import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { DateFormatter, DateFormatterProps } from '.';
import { DateTime } from 'luxon';

export default {
  title: 'Data/DateFormatter',
  component: DateFormatter,
  args: {
    format: DateTime.DATE_FULL,
  },
} as Meta<DateFormatterProps>;

export const Default: StoryFn<DateFormatterProps> = (args) => (
  <div>
    provides a wrapper component for formatting dates to the standard format used throughout takaro.
    <DateFormatter ISODate={args.ISODate} format={args.format} />
  </div>
);
