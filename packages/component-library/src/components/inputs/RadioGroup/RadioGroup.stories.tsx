import { useMemo, useState } from 'react';
import { Button } from '../..';
import { Meta, Story } from '@storybook/react';
import { RadioGroup, RadioGroupProps } from '.';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useValidationSchema } from '../../..';
import { DevTool } from '@hookform/devtools';
import * as yup from 'yup';

export default {
  title: 'Inputs/RadioGroup/Default',
  component: RadioGroup
} as Meta;

export const OnChange: Story<RadioGroupProps> = () => {
  type FormFields = {
    gender: string;
  };

  const [result, setResult] = useState<string>('');

  const validationSchema = useMemo(
    () =>
      yup.object({
        gender: yup.string().required('Pick a gender')
      }),
    []
  );

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onChange',
    resolver: useValidationSchema(validationSchema)
  });

  const onSubmit: SubmitHandler<FormFields> = async ({ gender }) => {
    setResult(gender);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RadioGroup
          control={control}
          label="Enter your gender"
          name="gender"
          options={[
            { label: 'male', labelPosition: 'right', value: 'm' },
            { label: 'female', labelPosition: 'right', value: 'f' }
          ]}
        />
        <Button
          onClick={() => {
            /* */
          }}
          text="submit"
          type="submit"
        />
        <DevTool control={control} />
      </form>
      <div>Result: {result}</div>
    </>
  );
};
