import React from 'react';
import { useState, useMemo } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { CodeField, CodeFieldProps } from '../../../components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '../../actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

export const onSubmit: StoryFn<CodeFieldProps> = (args) => {
  const [result, setResult] = useState<string>();

  const validationSchema = useMemo(
    () =>
      z.object({
        code: z.string().min(args.fields).max(args.fields),
      }),
    [args.fields]
  );

  const { handleSubmit, control } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = async ({ code }) => {
    setResult(code);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CodeField
          control={control}
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
  const { control, handleSubmit } = useForm<FormFields>();
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
        <CodeField autoSubmit={handleSubmit(onSubmit)} control={control} fields={6} loading={loading} name="code" />
      </form>
      <div>Result: {result}</div>
    </>
  );
};
