import { FC, useMemo } from 'react';
import { Button, Divider, Select, Tabs, TextField } from '../../../../components';
import { Calendar } from '../Calendar';
import { useDatePickerContext, useDatePickerDispatchContext } from '../Context';
import { TimePicker } from '../TimePicker';
import { styled } from '../../../../styled';
import { SubmitHandler, useForm } from 'react-hook-form';
import { DateTime, DateTimeUnit } from 'luxon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GenericTextField } from '../../TextField/Generic';

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[1]};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

interface DateSelectorProps {
  isStart: boolean;
}

interface IFormInputs {
  relativeTimeSpan: string;
  timeSpanAmount: number;
}

export const DateSelector: FC<DateSelectorProps> = ({ isStart }) => {
  const dispatch = useDatePickerDispatchContext();
  const state = useDatePickerContext();

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

  if (!dispatch || !state) {
    throw new Error('useDatePickerDispatchContext and useDatePickerContext must be used within a DatePickerProvider');
  }

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
    <Tabs defaultValue="absolute">
      <Tabs.List>
        <Tabs.Trigger value="absolute">Absolute</Tabs.Trigger>
        <Tabs.Trigger value="relative">Relative</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="absolute">
        <Wrapper>
          <Container>
            <Calendar
              onDateClick={(date) => {
                if (isStart) dispatch({ type: 'set_absolute_start_date', payload: { startDate: date } });
                else dispatch({ type: 'set_absolute_end_date', payload: { endDate: date } });
              }}
              id={isStart ? 'start' : 'end'}
              selectedDate={isStart ? state.start : state.end}
            />
            <TimePicker
              selectedDate={isStart ? state.start : state.end}
              onChange={(date) => {
                if (isStart) dispatch({ type: 'set_absolute_start_date', payload: { startDate: date } });
                else dispatch({ type: 'set_absolute_end_date', payload: { endDate: date } });
              }}
            />
          </Container>
        </Wrapper>
      </Tabs.Content>
      <Tabs.Content value="relative">
        <Wrapper>
          <Container>
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
              <Button type="submit" text="Apply" />
            </StyledForm>
          </Container>
          <GenericTextField
            hasDescription={false}
            hasError={false}
            name={`date-preview-${isStart}`}
            id={`date-preview-${isStart}`}
            onChange={() => {}}
            readOnly={true}
            value={
              isStart
                ? state.start.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')
                : state.end.toFormat('LLL d, yyyy @ HH:mm:ss.SSS')
            }
          />
          <Divider fullWidth />
          {/* todo: add option to round selected unit */}
        </Wrapper>
      </Tabs.Content>
    </Tabs>
  );
};
