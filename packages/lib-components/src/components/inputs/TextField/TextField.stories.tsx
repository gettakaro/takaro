import { useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { TextField, TextFieldProps } from '.';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '../../../';
import * as yup from 'yup';
import { useValidationSchema } from '../../../hooks';

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
    suffix: '.io',
  },
} as Meta<TextFieldProps>;

export const Default: StoryFn<TextFieldProps> = (args) => {
  type FormFields = { name: string };
  const [result, setResult] = useState<string>('none');

  const validationSchema = useMemo(
    () =>
      yup.object<Record<keyof FormFields, yup.AnySchema>>({
        name: yup.string().min(6).required('Name is a required field.'),
      }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      name: '',
    },
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema),
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
          name="textfield"
          placeholder={args.placeholder}
          required={args.required}
          hint={args.hint}
          error={errors.name}
        />
        <TextField
          control={control}
          label={args.label}
          name="textfield"
          placeholder={args.placeholder}
          prefix={args.prefix}
          required={args.required}
          hint={args.hint}
          error={errors.name}
        />
        <TextField
          control={control}
          label={args.label}
          name="textfield"
          placeholder={args.placeholder}
          suffix={args.suffix}
          required={args.required}
          hint={args.hint}
          error={errors.name}
        />
        <TextField
          control={control}
          label={args.label}
          name="textfield"
          placeholder={args.placeholder}
          prefix={args.prefix}
          suffix={args.suffix}
          required={args.required}
          hint={args.hint}
          error={errors.name}
        />
        <Button type="submit" text="Submit form" size="large" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};

export const Password: StoryFn<FieldProps> = (args) => {
  type FormFields = { password: string };
  const { control, formState } = useForm<FormFields>({
    defaultValues: {
      password: '',
    },
  });

  return (
    <Wrapper>
      <TextField
        control={control}
        label={args.label}
        name="name"
        placeholder={args.placeholder}
        type="password"
        hint={args.hint}
        required={args.required}
        error={formState.errors.password}
      />
    </Wrapper>
  );
};
