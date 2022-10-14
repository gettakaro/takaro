import { useState, useMemo } from 'react';
import { Story, Meta } from '@storybook/react';
import { Button } from '../../../components';
import { CodeField, CodeFieldProps } from './index';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
import { useValidationSchema } from '../../..';

export default {
  title: 'Inputs/CodeField',
  component: CodeField
} as Meta;

type FormFields = { code: string };

export const Default: Story<CodeFieldProps> = () => {
  const [result, setResult] = useState<string>();

  const validationSchema = useMemo(
    () =>
      yup.object({
        code: yup.string().min(6).required('Code is a required field.')
      }),
    []
  );

  const { control, handleSubmit, formState } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema)
  });
  const onSubmit: SubmitHandler<FormFields> = async ({ code }) => {
    setResult(code);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CodeField control={control} error={formState.errors.code} fields={6} name="code" />
        <button type="submit">submit form</button>
      </form>
      <div>{result}</div>
    </>
  );
};

export const Loading: Story = () => {
  const { control, formState } = useForm<FormFields>();

  return (
    <CodeField control={control} error={formState.errors.code} fields={6} loading name="code" />
  );
};

export const AutoSubmit: Story = () => {
  const [result, setResult] = useState<string>();
  const { control, formState, handleSubmit } = useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormFields> = async ({ code }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(code);
    }, 2000);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CodeField
          autoSubmit={handleSubmit(onSubmit)}
          control={control}
          error={formState.errors.code}
          fields={6}
          loading={loading}
          name="code"
        />
      </form>
      <div>Result: {result}</div>
    </>
  );
};
