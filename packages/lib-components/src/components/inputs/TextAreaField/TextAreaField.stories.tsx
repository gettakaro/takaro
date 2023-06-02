import React from 'react';
import { useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { TextAreaField, TextAreaFieldProps, Button } from '../../../components';
import { useForm, SubmitHandler } from 'react-hook-form';
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
  },
} as Meta<TextAreaFieldProps>;

export const Default: StoryFn<TextAreaFieldProps> = (args) => {
  type FormFields = { name: string };
  const [result, setResult] = useState<string>('none');

  const validationSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(6).nonempty('Name is a required field.'),
      }),
    []
  );

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
      <p>result: {result}</p>
    </Wrapper>
  );
};
