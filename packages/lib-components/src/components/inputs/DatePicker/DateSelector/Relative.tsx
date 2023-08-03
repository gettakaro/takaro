import { FC, useMemo } from 'react';
import { styled } from '../../../../styled';
import { Button, Select, TextField } from '../../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { DateTime, DateTimeUnit } from 'luxon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDatePickerContext, useDatePickerDispatchContext } from '../Context';

const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface RelativeProps {
  isStart: boolean;
}

export const Relative: FC<RelativeProps> = ({ isStart }) => {
  const dispatch = useDatePickerDispatchContext();
  const state = useDatePickerContext();

  if (!dispatch || !state) {
    throw new Error('useDatePickerDispatchContext and useDatePickerContext must be used within a DatePickerProvider');
  }

  interface IFormInputs {
    relativeTimeSpan: string;
    timeSpanAmount: number;
  }

  const relativeOptions: Record<string, DateTimeUnit> = useMemo(() => {
    if (isStart) {
      return {
        'Seconds ago': 'second',
        'Minutes ago': 'minute',
        'Hours ago': 'hour',
        'Days ago': 'day',
        'Weeks ago': 'week',
        'Months ago': 'month',
        'Years ago': 'year',
        'Seconds from now': 'second',
        'Minutes from now': 'minute',
        'Hours from now': 'hour',
        'Days from now': 'day',
        'Weeks from now': 'week',
        'Months from now': 'month',
        'Years from now': 'year',
      };
    } else {
      return {
        'Seconds ago': 'second',
        'Seconds from now': 'second',
        'Minutes from now': 'minute',
        'Hours from now': 'hour',
        'Days from now': 'day',
        'Weeks from now': 'week',
        'Months from now': 'month',
        'Years from now': 'year',
        'Minutes ago': 'minute',
        'Hours ago': 'hour',
        'Days ago': 'day',
        'Weeks ago': 'week',
        'Months ago': 'month',
        'Years ago': 'year',
      };
    }
  }, []);

  function assertNonEmptyArray<T>(array: T[]): asserts array is [T, ...T[]] {
    if (array.length === 0) {
      throw new Error('Array is empty');
    }
  }

  // need to assert that the keys are not empty for it to be a valid CONST enum
  const keys = Object.keys(relativeOptions);
  assertNonEmptyArray(keys);
  const relativeTimeSpanEnum = z.enum(keys);

  const validationSchema = useMemo(
    () =>
      z.object({
        timeSpanAmount: z.number().min(1, 'Time Span Amount must be greater than 0'),
        relativeTimeSpan: relativeTimeSpanEnum,
      }),
    []
  );

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    defaultValues: {
      relativeTimeSpan: keys.at(0),
      timeSpanAmount: 1,
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = ({ timeSpanAmount, relativeTimeSpan }) => {
    const unit = relativeOptions[relativeTimeSpan];
    const isAgo = relativeTimeSpan.includes('ago');
    const isFromNow = relativeTimeSpan.includes('from now');
    const friendlyName = `~ ${timeSpanAmount} ${relativeTimeSpan}`;

    let selectedDate;
    if (isAgo) {
      selectedDate = DateTime.local().minus({ [unit]: timeSpanAmount });
    } else if (isFromNow) {
      selectedDate = DateTime.local().plus({ [unit]: timeSpanAmount });
    } else {
      throw new Error('Invalid relative time span');
    }

    if (selectedDate) {
      if (isStart)
        dispatch({
          type: 'set_relative_start_date',
          payload: { startDate: selectedDate, friendlyStartDate: friendlyName },
        });
      else
        dispatch({ type: 'set_relative_end_date', payload: { endDate: selectedDate, friendlyEndDate: friendlyName } });
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <TextField
        key={`timeSpanAmount-${isStart}`}
        control={control}
        name="timeSpanAmount"
        label="Time Span Amount"
        type="number"
      />
      <Select
        key={`relativeTimeSpan-${isStart}`}
        inPortal
        control={control}
        name="relativeTimeSpan"
        label="Time Span"
        render={(selectedIndex) => (
          <div>
            {selectedIndex !== -1 ? Object.keys(relativeOptions)[selectedIndex] : Object.keys(relativeOptions).at(0)}
          </div>
        )}
      >
        <Select.OptionGroup>
          {Object.keys(relativeOptions).map((val: string) => (
            <Select.Option key={`${val}`} value={val}>
              <span>{val}</span>
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>
      <Button type="submit" text="Apply" />
    </StyledForm>
  );
};
