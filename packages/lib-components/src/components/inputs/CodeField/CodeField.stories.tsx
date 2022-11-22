import { useState, useMemo } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { CodeField, CodeFieldProps } from './index';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
import { Button } from '../../actions';
import { useValidationSchema } from '../../..';

export default {
  title: 'Inputs/CodeField',
  component: CodeField,
  args: {
    required: true,
    disabled: false,
    loading: false,
    readOnly: false,
    fields: 6,
    label: 'Code field',
    size: 'medium',
  },
} as Meta<CodeFieldProps>;

type FormFields = { code: string };

export const Default: StoryFn<CodeFieldProps> = (args) => {
  const [result, setResult] = useState<string>();

  const validationSchema = useMemo(
    () =>
      yup.object({
        code: yup
          .string()
          .min(args.fields)
          .max(args.fields)
          .required('Code is a required field.'),
      }),
    [args.fields]
  );

  const { control, handleSubmit, formState } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = async ({ code }) => {
    setResult(code);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CodeField
          control={control}
          error={formState.errors.code}
          fields={args.fields}
          name="code"
          loading={args.loading}
          disabled={args.disabled}
          required={args.required}
          readOnly={args.readOnly}
          label={args.label}
          size={args.size}
        />
        <Button type="submit" text="Submit form" />
      </form>
      <div>{result}</div>
    </>
  );
};

export const AutoSubmit: StoryFn<CodeFieldProps> = () => {
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
