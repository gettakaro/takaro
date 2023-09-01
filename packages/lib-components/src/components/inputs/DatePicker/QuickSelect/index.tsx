import { Button, Divider, Select, TextField } from '../../../../components';
import { FC, useMemo } from 'react';
import { styled } from '../../../../styled';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDatePickerDispatchContext } from '../Context';
import { DateTime, DateTimeUnit } from 'luxon';

enum Tense {
  Last = 'Last',
  Next = 'Next',
}

enum Unit {
  Seconds = 'Seconds',
  Minutes = 'Minutes',
  Hours = 'Hours',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
  Years = 'Years',
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[2]};
  min-width: 400px;
  h4 {
    margin-bottom: ${({ theme }) => theme.spacing['1']};
  }
`;

const CommonlyUsedGrid = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, 1fr);
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
  padding: 0 ${({ theme }) => theme.spacing[1]};

  li {
    text-align: left;
    cursor: pointer;
  }
`;

const StyledForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const InputsContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 0.5fr 0.5fr 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  div {
    width: 100%;
    margin-bottom: 0;
  }
`;

interface FormInputs {
  tense: string;
  step: number;
  unit: string;
}

interface QuickSelectProps {
  id: string;
}

export const QuickSelect: FC<QuickSelectProps> = ({ id }) => {
  const dispatch = useDatePickerDispatchContext();

  if (!dispatch) {
    throw new Error('useDatePickerDispatchContext must be used within a DatePickerProvider');
  }

  const validationSchema = useMemo(
    () =>
      z.object({
        tense: z.nativeEnum(Tense),
        step: z.number().positive(),
        unit: z.nativeEnum(Unit),
      }),
    []
  );

  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      step: 15,
      tense: Tense.Last,
      unit: Unit.Minutes,
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = ({ tense, step, unit }) => {
    const baseDate =
      tense === Tense.Last ? DateTime.local() : DateTime.local().startOf(unit.toLowerCase() as DateTimeUnit);
    const action = tense === Tense.Last ? 'minus' : 'plus';
    const range = { [unit.toLowerCase()]: step };
    const otherDate = baseDate[action](range);

    const startDate = tense === Tense.Last ? otherDate : baseDate;
    const endDate = tense === Tense.Last ? baseDate : otherDate;
    const friendlyRangeName = `${tense} ${step} ${unit.toLowerCase()}`;

    dispatch({
      type: 'set_range',
      payload: {
        startDate,
        endDate,
        friendlyRange: friendlyRangeName,
      },
    });
  };

  return (
    <Container>
      <h4>Quick select</h4>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <InputsContainer>
          <Select
            inPortal
            control={control}
            name="tense"
            render={(selectedIndex) => (
              <div>{selectedIndex !== -1 ? Object.values(Tense)[selectedIndex] : Tense.Last}</div>
            )}
          >
            <Select.OptionGroup>
              {Object.values(Tense).map((val: string) => (
                <Select.Option key={`${val}-${id}`} value={val}>
                  <span>{val}</span>
                </Select.Option>
              ))}
            </Select.OptionGroup>
          </Select>

          <TextField control={control} type="number" name="step" />

          <Select
            inPortal
            control={control}
            name="unit"
            render={(selectedIndex) => (
              <div>{selectedIndex !== -1 ? Object.values(Unit)[selectedIndex] : Unit.Minutes}</div>
            )}
          >
            <Select.OptionGroup>
              {Object.values(Unit).map((val: string) => (
                <Select.Option key={`${val}-${id}`} value={val}>
                  <span>{val}</span>
                </Select.Option>
              ))}
            </Select.OptionGroup>
          </Select>
        </InputsContainer>
        <Button type="submit" text="Apply" />
      </StyledForm>

      <Divider fullWidth />
      <h4>Commonly used</h4>
      <CommonlyUsedGrid>
        <li
          onClick={() =>
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().startOf('day'),
                endDate: DateTime.local().endOf('day'),
                friendlyRange: 'Today',
              },
            })
          }
        >
          Today
        </li>

        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().startOf('week'),
                endDate: DateTime.local().endOf('week'),
                friendlyRange: 'This week',
              },
            });
          }}
        >
          This week
        </li>
        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().minus({ minutes: 15 }),
                endDate: DateTime.local(),
                friendlyRange: 'Last 15 minutes',
              },
            });
          }}
        >
          Last 15 minutes
        </li>

        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().minus({ minutes: 30 }),
                endDate: DateTime.local(),
                friendlyRange: 'Last 30 minutes',
              },
            });
          }}
        >
          Last 30 minutes
        </li>

        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().minus({ hours: 1 }),
                endDate: DateTime.local(),
                friendlyRange: 'Last hour',
              },
            });
          }}
        >
          Last 1 hour
        </li>

        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().minus({ hours: 24 }),
                endDate: DateTime.local(),
                friendlyRange: 'Last 24 hours',
              },
            });
          }}
        >
          Last 24 hours
        </li>

        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().minus({ days: 7 }),
                endDate: DateTime.local(),
                friendlyRange: 'Last 7 days',
              },
            });
          }}
        >
          Last 7 days
        </li>

        <li
          onClick={() => {
            dispatch({
              type: 'set_range',
              payload: {
                startDate: DateTime.local().minus({ days: 30 }),
                endDate: DateTime.local(),
                friendlyRange: 'Last 30 days',
              },
            });
          }}
        >
          Last 30 days
        </li>
      </CommonlyUsedGrid>
    </Container>
  );
};
