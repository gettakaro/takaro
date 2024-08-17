import React, { ChangeEvent, useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button, RadioGroup, RadioGroupProps } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GenericRadioGroup } from './Generic';

const options = [
  { value: 'm', label: 'male' },
  { value: 'f', label: 'female' },
];

export default {
  title: 'Inputs/RadioGroup',
  component: RadioGroup,
  args: {
    readOnly: false,
    disabled: false,
    loading: false,
    hint: 'this is the hint',
    label: 'Enter your gender',
    description: 'this is the description',
    required: true,
  },
} as Meta<RadioGroupProps>;

export const OnSubmit: StoryFn<RadioGroupProps> = (args) => {
  type FormFields = {
    gender: string;
  };

  const [result, setResult] = useState<string>('');

  const validationSchema = useMemo(
    () =>
      z.object({
        gender: z.enum(['m', 'f']),
      }),
    [],
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
          label={args.label}
          name="gender"
          hint={args.hint}
          disabled={args.disabled}
          required={args.required}
          description={args.description}
        >
          {options.map(({ value, label }) => (
            <div
              key={`gender-${value}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
            >
              <RadioGroup.Item value={value} id={value} />
              <label htmlFor={value} style={{ cursor: !args.disabled && !args.readOnly ? 'pointer' : 'default' }}>
                {label}
              </label>
            </div>
          ))}
        </RadioGroup>
        <Button text="submit" type="submit" />
      </form>
      <div>Result: {result}</div>
    </>
  );
};

export const Generic: StoryFn<RadioGroupProps> = (args) => {
  const id = 'gender';
  const [value, setValue] = useState<string>('m');
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return (
    <div>
      <GenericRadioGroup
        id={id}
        readOnly={args.readOnly}
        name="gender"
        required={args.required}
        disabled={args.disabled}
        hasDescription={!!args.description}
        hasError={false}
        value={value}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange={handleOnChange}
      >
        {options.map(({ value, label }) => (
          <div
            key={`${id}-${value}`}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
          >
            <GenericRadioGroup.Item value={value} id={value} />
            <label htmlFor={value}>{label}</label>
          </div>
        ))}
      </GenericRadioGroup>
      <>{value}</>
    </div>
  );
};
