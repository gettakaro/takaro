export type PeriodType = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute';

interface CronValues {
  period: PeriodType;
  months: string[];
  monthDays: string[];
  weekDays: string[];
  hours: string[];
  minutes: string[];
}

function expandRange(range: string): string[] {
  const [start, end] = range.split('-').map((num) => parseInt(num));
  const result: string[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i.toString());
  }
  return result;
}

function determinePeriod(cronValues: string[]): PeriodType {
  const [minute, hour, dayMonth, month, dayWeek] = cronValues;

  if (minute === '*') return 'minute';
  if (hour === '*') return 'hour';
  if (dayMonth === '*' && dayWeek === '*') return 'day';
  if (dayMonth === '*' && dayWeek !== '*') return 'week';
  if (dayMonth !== '*' && month === '*') return 'month';
  return 'year';
}

export function parseCronString(cronString: string): CronValues {
  // Split the cron string into its components
  const parts = cronString.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error('Invalid cron string format. Expected 5 space-separated fields.');
  }

  const [minute, hour, dayMonth, month, dayWeek] = parts;

  // Determine the period type based on which fields use asterisks
  const period = determinePeriod(parts);

  // Parse each field into arrays of values
  const values: CronValues = {
    period,
    minutes: parseField(minute),
    hours: parseField(hour),
    monthDays: parseField(dayMonth),
    months: parseField(month),
    weekDays: parseField(dayWeek),
  };

  return values;
}

function parseField(field: string): string[] {
  if (field === '*') return [];

  return field.split(',').flatMap((part) => {
    if (part.includes('-')) {
      return expandRange(part);
    }
    return [part];
  });
}

export function convertToRanges(values: string[] | undefined): string {
  if (!values || values.length === 0) return '*';

  // Convert strings to numbers and sort
  const nums = values.map((v) => parseInt(v)).sort((a, b) => a - b);

  const ranges: string[] = [];
  let rangeStart = nums[0];
  let prev = nums[0];

  for (let i = 1; i <= nums.length; i++) {
    const current = nums[i];
    // If not consecutive or end of array
    if (current !== prev + 1 || i === nums.length) {
      if (rangeStart === prev) {
        // Single number
        ranges.push(rangeStart.toString());
      } else {
        // Range of numbers
        ranges.push(`${rangeStart}-${prev}`);
      }
      rangeStart = current;
    }
    prev = current;
  }

  return ranges.join(',');
}

export function getCronStringFromValues(
  period: PeriodType,
  months: string[] | undefined,
  monthDays: string[] | undefined,
  weekDays: string[] | undefined,
  hours: string[] | undefined,
  minutes: string[] | undefined
): string {
  // Standard cron format: minute hour day-of-month month day-of-week
  let cronParts: string[] = ['*', '*', '*', '*', '*'];

  switch (period) {
    case 'minute':
      // Every minute
      cronParts = ['*', '*', '*', '*', '*'];
      break;

    case 'hour':
      // Specific minute, every hour
      cronParts = [minutes?.length ? convertToRanges(minutes) : '0', '*', '*', '*', '*'];
      break;

    case 'day':
      // Specific minute and hour, every day
      cronParts = [
        minutes?.length ? convertToRanges(minutes) : '0',
        hours?.length ? convertToRanges(hours) : '0',
        '*',
        '*',
        '*',
      ];
      break;

    case 'week':
      // Specific minute, hour, and weekday
      cronParts = [
        minutes?.length ? convertToRanges(minutes) : '0',
        hours?.length ? convertToRanges(hours) : '0',
        '*',
        '*',
        weekDays?.length ? convertToRanges(weekDays) : '*',
      ];
      break;

    case 'month':
      // Specific minute, hour, and day of month
      cronParts = [
        minutes?.length ? convertToRanges(minutes) : '0',
        hours?.length ? convertToRanges(hours) : '0',
        monthDays?.length ? convertToRanges(monthDays) : '1',
        '*',
        '*',
      ];
      break;

    case 'year':
      // Specific minute, hour, day of month, and month
      cronParts = [
        minutes?.length ? convertToRanges(minutes) : '0',
        hours?.length ? convertToRanges(hours) : '0',
        monthDays?.length ? convertToRanges(monthDays) : '1',
        months?.length ? convertToRanges(months) : '1',
        '*',
      ];
      break;
  }

  return cronParts.join(' ');
}
