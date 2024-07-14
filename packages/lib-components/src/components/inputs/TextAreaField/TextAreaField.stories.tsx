import React from 'react';
import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { TextAreaField, TextAreaFieldProps, Button } from '../../../components';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  title: 'Inputs/TextAreaField',
  component: TextAreaField,
  args: {
    label: 'Name',
    placeholder: 'this is the placeholder',
    required: true,
    readOnly: false,
    disabled: false,
    name: 'TextAreaField',
  },
} as Meta<TextAreaFieldProps>;

const validationSchema = z.object({
  name: z.string().min(6),
});

type FormFields = { name: string };

export const OnChange: StoryFn<TextAreaFieldProps> = (args) => {
  const { control } = useForm<FormFields>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
  });
  const TextAreaFieldValue = useWatch({
    name: 'name',
    control,
    defaultValue: '',
  });

  return (
    <>
      <TextAreaField
        name="name"
        placeholder={args.placeholder}
        required={args.required}
        hint={args.hint}
        label={args.label}
        control={control}
        readOnly={args.readOnly}
        disabled={args.disabled}
      />
      <pre>value: {TextAreaFieldValue}</pre>
    </>
  );
};

export const OnSubmit: StoryFn<TextAreaFieldProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      name: '',
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
        <TextAreaField
          control={control}
          label={args.label}
          name="name"
          placeholder={args.placeholder}
          required={args.required}
          hint={args.hint}
        />
        <Button type="submit" text="Submit form" size="large" />
      </form>
      <pre>result: {result}</pre>
    </Wrapper>
  );
};
