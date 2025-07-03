import { Button, Divider, SelectField, TextField } from '../../../../../components';
import { FC, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDateRangePickerDispatchContext, useDateRangePickerContext } from '../Context';
import { DateTime, DateTimeUnit } from 'luxon';
import { Container, StyledForm, InputsContainer, CommonlyUsedGrid } from './style';
import { Tense, Unit } from '../../types';

interface FormInputs {
  tense: string;
  step: number;
  unit: string;
}

interface QuickSelectProps {
  id: string;
}

export const QuickSelect: FC<QuickSelectProps> = ({ id }) => {
  const state = useDateRangePickerContext();
  const dispatch = useDateRangePickerDispatchContext();

  if (!dispatch) {
    throw new Error('useDateRangePickerDispatchContext must be used within a DateRangePickerProvider');
  }

  const validationSchema = useMemo(
    () =>
      z.object({
        tense: z.nativeEnum(Tense),
        step: z.number().positive(),
        unit: z.nativeEnum(Unit),
      }),
    [],
  );

  const { control, handleSubmit } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      step: state?.quickSelect.step,
      tense: state?.quickSelect.tense,
      unit: state?.quickSelect.unit,
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
      type: 'set_quick_select',
      payload: {
        quickSelect: {
          show: false,
          tense: tense as Tense,
          step,
          unit: unit as Unit,
        },
      },
    });

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
          <SelectField
            control={control}
            name="tense"
            render={(selectedItems) => (
              <div>
                {selectedItems.length > 0 ? Object.values(Tense).find((v) => v === selectedItems[0].value) : Tense.Last}
              </div>
            )}
          >
            <SelectField.OptionGroup>
              {Object.values(Tense).map((val: string) => (
                <SelectField.Option key={`${val}-${id}`} value={val} label={val}>
                  <span>{val}</span>
                </SelectField.Option>
              ))}
            </SelectField.OptionGroup>
          </SelectField>

          <TextField control={control} type="number" name="step" />

          <SelectField
            control={control}
            name="unit"
            render={(selectedItems) => (
              <div>
                {selectedItems.length > 0
                  ? Object.values(Unit).find((v) => v === selectedItems[0].value)
                  : Unit.Minutes}
              </div>
            )}
          >
            <SelectField.OptionGroup>
              {Object.values(Unit).map((val: string) => (
                <SelectField.Option key={`${val}-${id}`} value={val} label={val}>
                  <span>{val}</span>
                </SelectField.Option>
              ))}
            </SelectField.OptionGroup>
          </SelectField>
        </InputsContainer>
        <Button type="submit">Apply</Button>
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
