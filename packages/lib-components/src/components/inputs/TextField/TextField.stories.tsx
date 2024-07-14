import React from 'react';
import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { TextField, TextFieldProps, Button } from '../../../components';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GenericTextField } from './Generic';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 50%;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default {
  title: 'Inputs/TextField',
  component: TextField,
  args: {
    label: 'Url',
    placeholder: 'placeholder',
    required: true,
    hint: 'this is the hint',
    prefix: 'https://',
    type: 'text',
    suffix: '.io',
    loading: false,
    name: 'name',
    readOnly: false,
    disabled: false,
    description: 'this is the description',
  },
} as Meta<TextFieldProps>;

const validationSchema = z.object({
  name: z.string().min(6, 'Name must be at least 6 characters'),
});
type FormFields = { name: string };

export const onChange: StoryFn<TextFieldProps> = (args) => {
  const { control } = useForm({ mode: 'onChange' });
  const TextFieldValue = useWatch({ name: args.name, control });

  return (
    <>
      <TextField
        type={args.type}
        name={args.name}
        description={args.description}
        control={control}
        placeholder={args.placeholder}
        required={args.required}
        loading={args.loading}
        label={args.label}
        prefix={args.prefix}
        suffix={args.suffix}
        hint={args.hint}
        readOnly={args.readOnly}
        disabled={args.disabled}
      />
      <p>Value: {TextFieldValue}</p>
    </>
  );
};

export const OnSubmit: StoryFn<TextFieldProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      [args.name]: '',
    },
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ name }) => {
    setResult(name);
  };

  return (
    <Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          control={control}
          label={args.label}
          name={args.name}
          type={args.type}
          placeholder={args.placeholder}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          readOnly={args.readOnly}
          disabled={args.disabled}
          description={args.description}
        />
        <TextField
          control={control}
          label={args.label}
          name={args.name}
          placeholder={args.placeholder}
          prefix={args.prefix}
          loading={args.loading}
          required={args.required}
          hint={args.hint}
          readOnly={args.readOnly}
          disabled={args.disabled}
          description={args.description}
        />
        <TextField
          control={control}
          label={args.label}
          name={args.name}
          placeholder={args.placeholder}
          suffix={args.suffix}
          loading={args.loading}
          required={args.required}
          hint={args.hint}
          readOnly={args.readOnly}
          disabled={args.disabled}
          description={args.description}
        />
        <TextField
          control={control}
          label={args.label}
          name={args.name}
          placeholder={args.placeholder}
          prefix={args.prefix}
          suffix={args.suffix}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          readOnly={args.readOnly}
          disabled={args.disabled}
          description={args.description}
        />
        <Button type="submit" text="Submit form" size="large" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};

export const Password: StoryFn<TextFieldProps> = (args) => {
  type FormFields = { password: string };
  const { control } = useForm<FormFields>({
    defaultValues: {
      [args.name]: '',
    },
  });

  return (
    <Wrapper>
      <TextField
        control={control}
        label={args.label}
        name={args.name}
        placeholder={args.placeholder}
        type="password"
        hint={args.hint}
        required={args.required}
        loading={args.loading}
        readOnly={args.readOnly}
        disabled={args.disabled}
        description={args.description}
      />
    </Wrapper>
  );
};

export const Generic: StoryFn = () => {
  const [value, setValue] = useState<string>('');

  return (
    <>
      <GenericTextField
        hasError={false}
        onChange={(e) => setValue(e.target.value)}
        placeholder="placeholder"
        required={false}
        name="name"
        value={value}
        id="generic-text-field"
        hasDescription={false}
        disabled={false}
        readOnly={false}
      />
      <pre>{value}</pre>
    </>
  );
};
