import { FC, useMemo } from 'react';
import { Button, Select, TextField } from '../../../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { DateTime, DateTimeUnit } from 'luxon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledForm, InputsContainer } from './style';

interface RelativeProps {
  onChange: (value: DateTime, friendlyName?: string) => void;
}

export const Relative: FC<RelativeProps> = ({ onChange }) => {
  interface IFormInputs {
    relativeTimeSpan: string;
    timeSpanAmount: number;
  }

  const relativeOptions: Record<string, DateTimeUnit> = {
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
    const isPast = relativeTimeSpan.includes('ago');
    const friendlyName = `~ ${timeSpanAmount} ${relativeTimeSpan}`;

    let selectedDate = DateTime.now();
    selectedDate = isPast
      ? selectedDate.minus({ [unit]: timeSpanAmount })
      : selectedDate.plus({ [unit]: timeSpanAmount });

    console.log(selectedDate);
    onChange(selectedDate, friendlyName);
  };

  return (
    <>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <InputsContainer>
          <TextField control={control} name="timeSpanAmount" type="number" />
          <Select
            inPortal
            control={control}
            name="relativeTimeSpan"
            render={(selectedIndex) => (
              <div>
                {selectedIndex !== -1
                  ? Object.keys(relativeOptions)[selectedIndex]
                  : Object.keys(relativeOptions).at(0)}
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
        </InputsContainer>
        <Button type="submit" text="Apply" />
      </StyledForm>
      {/* Todo add button to round the date */}
    </>
  );
};
