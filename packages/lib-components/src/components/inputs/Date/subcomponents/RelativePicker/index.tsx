import { FC, useMemo } from 'react';
import { Button, Divider, SelectField, TextField } from '../../../../../components';
import { useForm } from 'react-hook-form';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, StyledForm, InputsContainer, QuickSelectGrid, TenseGrid } from './style';

export type timeDirection = 'past' | 'future' | 'pastAndFuture';

export enum Tense {
  Last = 'Last',
  Next = 'Next',
}

export enum Unit {
  Seconds = 'Seconds',
  Minutes = 'Minutes',
  Hours = 'Hours',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
  Years = 'Years',
}

interface RelativePickerProps {
  onChange: (value: DateTime, friendlyName?: string) => void;
  timeDirection?: timeDirection;
  id: string;
}

interface QuickSelectOption {
  unit: Unit;
  step: number;
}

const quickSelectOptions: QuickSelectOption[] = [
  { unit: Unit.Minutes, step: 5 },
  { unit: Unit.Minutes, step: 15 },
  { unit: Unit.Minutes, step: 30 },
  { unit: Unit.Hours, step: 1 },
  { unit: Unit.Days, step: 1 },
  { unit: Unit.Days, step: 7 },
  { unit: Unit.Days, step: 30 },
];

export const RelativePicker: FC<RelativePickerProps> = ({ onChange, id, timeDirection = 'pastAndFuture' }) => {
  interface IFormInputs {
    step: number;
    tense: Tense;
    unit: Unit;
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

  const defaultTense = () => {
    switch (timeDirection) {
      case 'past':
        return Tense.Last;
      case 'future':
        return Tense.Next;
      case 'pastAndFuture':
        return Tense.Last;
    }
  };

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    defaultValues: {
      tense: defaultTense(),
    },
    resolver: zodResolver(validationSchema),
  });

  const handleChange = ({ tense, step, unit }: IFormInputs) => {
    const isPast = tense === Tense.Last;

    const friendlyTense = tense === Tense.Next ? 'from now' : 'ago';
    const friendlyRangeName = `${step} ${unit.toLowerCase()} ${friendlyTense}`;

    let selectedDate = DateTime.now();
    selectedDate = isPast ? selectedDate.minus({ [unit]: step }) : selectedDate.plus({ [unit]: step });

    onChange(selectedDate, friendlyRangeName);
  };

  return (
    <>
      <Container>
        {/* Relative manual selection */}
        <StyledForm onSubmit={handleSubmit(handleChange)}>
          <InputsContainer>
            <SelectField
              inPortal
              control={control}
              readOnly={timeDirection !== 'pastAndFuture'}
              name="tense"
              render={(selectedItems) => (
                <div>
                  {selectedItems.length > 0
                    ? Object.values(Tense).find((v) => v === selectedItems[0].value)
                    : Tense.Last}
                </div>
              )}
            >
              <SelectField.OptionGroup>
                {Object.values(Tense).map((val: string) => (
                  <SelectField.Option key={`relative-tense-${val}-${id}`} value={val} label={val}>
                    <span>{val}</span>
                  </SelectField.Option>
                ))}
              </SelectField.OptionGroup>
            </SelectField>
            <TextField control={control} type="number" name="step" />
            <SelectField
              inPortal
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
                  <SelectField.Option key={`relative-unit-${val}-${id}`} value={val} label={val}>
                    <span>{val}</span>
                  </SelectField.Option>
                ))}
              </SelectField.OptionGroup>
            </SelectField>
          </InputsContainer>
          <Button type="submit" text="Apply" />
        </StyledForm>

        <Divider fullWidth />
        <h4>Commonly used</h4>
        <TenseGrid>
          {timeDirection !== 'future' && (
            <div>
              <h5>Past</h5>
              <QuickSelectGrid>
                {quickSelectOptions.map(({ unit, step }) => (
                  <li
                    key={`quick-select-${unit}-${step}-${id}-last`}
                    onClick={() => handleChange({ unit, step, tense: Tense.Last })}
                  >
                    {step} {unit.toLowerCase()} ago
                  </li>
                ))}
              </QuickSelectGrid>
            </div>
          )}

          {timeDirection !== 'past' && (
            <div>
              <h5>Future</h5>
              <QuickSelectGrid>
                {quickSelectOptions.map(({ unit, step }) => (
                  <li
                    key={`quick-select-${unit}-${step}-${id}-last`}
                    onClick={() => handleChange({ unit, step, tense: Tense.Next })}
                  >
                    {step} {unit.toLowerCase()} from now
                  </li>
                ))}
              </QuickSelectGrid>
            </div>
          )}
        </TenseGrid>
      </Container>
      {/* Quick select*/}
    </>
  );
};
