import React, { useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Button } from '../..';
import { CheckBox, CheckBoxProps } from '../../../components';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ResultContainer = styled.div`
  margin-top: 3rem;
`;

export default {
  title: 'Inputs/Checkbox/Form',
  component: CheckBox,
  args: {
    disabled: false,
    hint: '',
    label: 'Do you have a car?',
    loading: false,
    labelPosition: 'left',
    readOnly: false,
    required: false,
    size: 'medium',
  },
} as Meta<CheckBoxProps>;

export const OnChange: StoryFn<CheckBoxProps> = (args) => {
  type FormFields = {
    hasCar: boolean;
  };
  const { control } = useForm<FormFields>();
  const result = useWatch({ control, name: 'hasCar', defaultValue: false });

  return (
    <>
      <CheckBox
        control={control}
        label={args.label}
        labelPosition={args.labelPosition}
        name="hasCar"
        disabled={args.disabled}
        required={args.required}
        readOnly={args.readOnly}
        size={args.size}
        loading={args.loading}
      />
      <ResultContainer>Result: {result ? 'true' : 'false'}</ResultContainer>
    </>
  );
};

export const OnSubmit: StoryFn<CheckBoxProps> = (args) => {
  const [result, setResult] = useState<boolean>(false);

  type FormFields = {
    termsAndConditions: boolean;
  };

  const validationSchema = useMemo(() => z.literal(true), []);

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const submit: SubmitHandler<FormFields> = ({ termsAndConditions }) => {
    setResult(termsAndConditions);
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <CheckBox
          control={control}
          label="Do you accept the terms and conditions?"
          labelPosition="left"
          name="termsAndConditions"
          readOnly={args.readOnly}
          loading={args.loading}
          size={args.size}
          disabled={args.disabled}
          required={args.required}
        />
        <Button text="Submit Form" type="submit" />
      </form>
      <ResultContainer>Result: {result ? 'true' : 'false'}</ResultContainer>
    </>
  );
};
