import React from 'react';
import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../../styled';
import { Button, DatePicker, DatePickerProps } from '../../../../components';
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
  title: 'Inputs/DatePicker',
  component: DatePicker,
  args: {},
} as Meta<DatePickerProps>;

const validationSchema = z.object({
  name: z.string().min(6).nonempty('Name is a required field.'),
});
type FormFields = { name: string };

export const OnSubmit: StoryFn<DatePickerProps> = (args) => {
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
        <DatePicker
          control={control}
          label={args.label}
          name={args.name}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
        />
        <Button type="submit" text="Submit form" size="large" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};
