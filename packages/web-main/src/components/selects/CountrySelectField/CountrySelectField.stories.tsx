import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CountrySelectField, CountrySelectProps } from '.';

export default {
  title: 'CountrySelectField',
  component: CountrySelectField,
  args: {
    multiple: false,
    required: false,
    canClear: false,
    disabled: false,
    readOnly: false,
    description: 'The country will be used to determine the correct currency for your account.',
  },
} as Meta<CountrySelectProps>;

interface IFormInputs {
  countryCode: string;
}

export const Default: StoryFn<CountrySelectProps> = (args) => {
  const { control, handleSubmit } = useForm<IFormInputs>();
  const onSubmit: SubmitHandler<IFormInputs> = ({ countryCode }) => {
    console.log(countryCode);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CountrySelectField
        control={control}
        multiple={args.multiple}
        required={args.required}
        canClear={args.canClear}
        disabled={args.disabled}
        readOnly={args.readOnly}
        description={args.description}
        name="countryCode"
      />
    </form>
  );
};
