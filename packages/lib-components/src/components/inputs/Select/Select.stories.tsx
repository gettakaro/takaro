import { Meta, StoryFn } from '@storybook/react';
import { Select as SelectComponent, SelectProps } from '.';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { AiOutlineWallet as Wallet } from 'react-icons/ai';

export default {
  title: 'Inputs/Select',
  component: SelectComponent,
} as Meta<SelectProps>;

export const Select: StoryFn<SelectProps> = () => {
  type FormFields = { carBrand: string };
  const [result, setResult] = useState<string>('none');
  const { control, handleSubmit } = useForm<FormFields>();

  const submit: SubmitHandler<FormFields> = ({ carBrand }) => {
    setResult(carBrand);
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <Select
          control={control}
          icon={<Wallet />}
          label=""
          name="carBrand"
          options={[
            { label: 'Part Time', value: 'partTime' },
            { label: 'Full Time', value: 'fullTime' },
            { label: 'Casual', value: 'casual' }
          ]}
          placeholder="Select your car brand"
        />
        <button type="submit">submit form</button>
      </form>
      <p>result: {result}</p>
    </>
  );
};
