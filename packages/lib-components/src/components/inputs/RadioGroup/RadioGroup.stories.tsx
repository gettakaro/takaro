import React from 'react';
import { useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { RadioGroup, RadioGroupProps } from '.';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useValidationSchema } from '../../..';
import * as yup from 'yup';
import { Radio } from './Radio';
import { Button } from '../../../components';

export default {
  title: 'Inputs/RadioGroup',
  component: RadioGroup,
  subcomponents: { Radio },
  args: {
    readOnly: false,
    loading: false,
  },
} as Meta<RadioGroupProps>;

export const OnChange: StoryFn<RadioGroupProps> = (args) => {
  type FormFields = {
    gender: string;
  };

  const [result, setResult] = useState<string>('');

  const validationSchema = useMemo(
    () =>
      yup.object({
        gender: yup.string().required('Pick a gender'),
      }),
    []
  );

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onChange',
    resolver: useValidationSchema(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = async ({ gender }) => {
    setResult(gender);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RadioGroup
          control={control}
          loading={args.loading}
          readOnly={args.readOnly}
          label="Enter your gender"
          name="gender"
          options={[
            { label: 'male', labelPosition: 'right', value: 'm' },
            { label: 'female', labelPosition: 'right', value: 'f' },
          ]}
        />
        <Button text="submit" type="submit" />
      </form>
      <div>Result: {result}</div>
    </>
  );
};
