import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Switch, SwitchProps } from '.';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '../..';

const Wrapper = styled.div`
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;

  & > div {
    margin: 0 auto;
    padding: 0.2rem 1rem;
  }

  form {
    width: 100%;
  }
`;

export default {
  title: 'Inputs/Switch',
  component: Switch,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    label: 'I am a label',
    loading: false,
    name: 'switch01',
  },
} as Meta<SwitchProps>;

export const Default: StoryFn<SwitchProps> = (args) => {
  const { control } = useForm();
  return (
    <div>
      <Switch {...args} control={control} />
    </div>
  );
};

export const Form = () => {
  const [value, setValue] = useState<boolean>();

  const { control, handleSubmit } = useForm<FormFields>();

  type FormFields = {
    hasCar: boolean;
  };

  const onSubmit: SubmitHandler<FormFields> = ({ hasCar }) => {
    setValue(hasCar);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Switch name="hasCar" label="Do you have a car?" control={control} />
        <Button
          type="submit"
          text="submit"
          onClick={() => {
            /**/
          }}
        />
      </form>
      submitted value: {value ? 'true' : 'false'}
    </>
  );
};
