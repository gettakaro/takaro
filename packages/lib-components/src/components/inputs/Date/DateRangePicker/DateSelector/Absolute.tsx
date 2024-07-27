import { FC, useEffect, useMemo } from 'react';
import { Calendar } from '../../subcomponents/Calendar';
import { TimePicker } from '../../subcomponents/TimePicker';
import { useDateRangePickerContext, useDateRangePickerDispatchContext } from '../Context';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateTime } from 'luxon';
import { TextField, Divider } from '../../../../../components';
import { styled } from '../../../../../styled';

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledForm = styled.form<{ hasError: boolean }>`
  margin-top: ${({ theme }) => theme.spacing['0_5']};
  padding-bottom: ${({ theme, hasError }) => (hasError ? theme.spacing['2_5'] : 0)};
`;

interface AbsoluteProps {
  isStart: boolean;
}

export const Absolute: FC<AbsoluteProps> = ({ isStart }) => {
  const dispatch = useDateRangePickerDispatchContext();
  const state = useDateRangePickerContext();

  if (!dispatch || !state) {
    throw new Error(
      'useDateRangePickerDispatchContext and useDateRangePickerContext must be used within a DateRangePickerProvider',
    );
  }

  interface IFormInputs {
    date: string;
  }

  const validationSchema = useMemo(() => {
    return z.object({
      date: z.string().refine(
        (dateStr: string) => {
          const dateTime = DateTime.fromFormat(dateStr, 'MMM d, yyyy @ HH:mm:ss.SSS', { locale: 'en' });
          return dateTime.isValid;
        },
        {
          message: 'Invalid date format, it should be "MMM D, YYYY @ HH:mm:ss.SSS"',
        },
      ),
    });
  }, []);

  const { control, handleSubmit, setValue, formState, clearErrors } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    clearErrors('date');
    setValue(
      'date',
      isStart ? state.start.toFormat('MMM d, yyyy @ HH:mm:ss.SSS') : state.end.toFormat('MMM d, yyyy @ HH:mm:ss.SSS'),
    );
  }, [isStart ? state.start : state.end]);

  const onSubmit: SubmitHandler<IFormInputs> = ({ date }) => {
    const dateTime = DateTime.fromFormat(date, 'MMM d, yyyy @ HH:mm:ss.SSS', { locale: 'en' });
    if (isStart) dispatch({ type: 'set_absolute_start_date', payload: { startDate: dateTime } });
    else dispatch({ type: 'set_absolute_end_date', payload: { endDate: dateTime } });
  };

  return (
    <>
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
      <Divider fullWidth />
      <StyledForm hasError={formState.errors.date?.message ? true : false} onChange={handleSubmit(onSubmit)}>
        <TextField prefix={isStart ? 'Start date' : 'End date'} control={control} name="date" type="text" />
      </StyledForm>
    </>
  );
};
