import { Button, Divider, Select, TextField } from '../../../../components';
import { FC, useMemo } from 'react';
import { styled } from '../../../../styled';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  padding: ${({ theme }) => theme.spacing[1]};

  li {
    text-align: left;
    cursor: pointer;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
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
    console.log(tense, step, unit);
  };

  return (
    <Container>
      <h4>Quick select</h4>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <Select
          inPortal
          control={control}
          name="tense"
          label="Time Tense"
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

        <TextField control={control} label="Step" type="number" name="step" />

        <Select
          inPortal
          control={control}
          name="unit"
          label="Time Unit"
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
        <Button type="submit" text="Apply" />
      </StyledForm>

      <Divider fullWidth />
      <h4>Commonly used</h4>
      <CommonlyUsedGrid>
        <li>Today</li>
        <li>This week</li>
        <li>Last 15 minutes</li>
        <li>Last 30 minutes</li>
        <li>Last 1 hour</li>
        <li>Last 24 hours</li>
        <li>Last 7 days</li>
        <li>Last 30 days</li>
        <li>Last 90 days</li>
        <li>Last 1 year</li>
      </CommonlyUsedGrid>
    </Container>
  );
};
