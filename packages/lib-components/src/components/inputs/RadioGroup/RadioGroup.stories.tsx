import React from 'react';
import { useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button, RadioGroup, RadioGroupProps } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default {
  title: 'Inputs/RadioGroup',
  component: RadioGroup,
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
      z.object({
        gender: z.enum(['m', 'f']),
      }),
    []
  );

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
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
