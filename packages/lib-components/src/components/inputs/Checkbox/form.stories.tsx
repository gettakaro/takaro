import { useMemo, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Button } from '../..';
import { Checkbox, CheckboxProps } from '.';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { useValidationSchema } from '../../../hooks';

const ResultContainer = styled.div`
  margin-top: 3rem;
`;

export default {
  title: 'Inputs/Checkbox/Form',
  component: Checkbox,
} as Meta<CheckboxProps>;

export const OnChange: StoryFn<CheckboxProps> = () => {
  type FormFields = {
    hasCar: boolean;
  };
  const { control } = useForm<FormFields>();
  const result = useWatch({ control, name: 'hasCar', defaultValue: false });

  return (
    <>
      <Checkbox
        control={control}
        label="Do you have a car?"
        labelPosition="left"
        name="hasCar"
      />
      <ResultContainer>Result: {result ? 'true' : 'false'}</ResultContainer>
    </>
  );
};

export const OnSubmit: StoryFn<CheckboxProps> = () => {
  const [result, setResult] = useState<boolean>(false);

  type FormFields = {
    termsAndConditions: boolean;
  };

  const validationSchema = useMemo(
    () =>
      yup.object<Record<keyof FormFields, yup.AnySchema>>({
        termsAndConditions: yup.bool().oneOf([true], 'Field must be checked'),
      }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: useValidationSchema(validationSchema),
  });

  const submit: SubmitHandler<FormFields> = ({ termsAndConditions }) => {
    setResult(termsAndConditions);
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <Checkbox
          control={control}
          label="Do you accept the terms and conditions?"
          labelPosition="left"
          name="termsAndConditions"
          error={errors.termsAndConditions}
        />
        <Button
          onClick={() => {
            /* placeholder */
          }}
          text="Submit Form"
          type="submit"
        />
      </form>
      <ResultContainer>Result: {result ? 'true' : 'false'}</ResultContainer>
    </>
  );
};
