import { DateTime } from 'luxon';

const DateAndTimeFormats = [
  DateTime.DATETIME_SHORT,
  DateTime.DATETIME_MED,
  DateTime.DATETIME_FULL,
  DateTime.DATETIME_HUGE,
  DateTime.DATETIME_SHORT_WITH_SECONDS,
  DateTime.DATETIME_MED_WITH_SECONDS,
  DateTime.DATETIME_FULL_WITH_SECONDS,
  DateTime.DATETIME_HUGE_WITH_SECONDS,
];

export const timeFormats = [
  DateTime.TIME_SIMPLE,
  DateTime.TIME_WITH_SECONDS,
  DateTime.TIME_WITH_SHORT_OFFSET,
  DateTime.TIME_WITH_LONG_OFFSET,
  DateTime.TIME_24_SIMPLE,
  DateTime.TIME_24_WITH_SECONDS,
  DateTime.TIME_24_WITH_SHORT_OFFSET,
  DateTime.TIME_24_WITH_LONG_OFFSET,
  ...DateAndTimeFormats,
].map((format) => JSON.stringify(format));

export const dateFormats = [
  DateTime.DATE_SHORT,
  DateTime.DATE_MED,
  DateTime.DATE_FULL,
  DateTime.DATE_HUGE,
  ...DateAndTimeFormats,
].map((format) => JSON.stringify(format));
