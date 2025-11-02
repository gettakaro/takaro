import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Switch, SwitchProps, Button } from '../../../components';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';

const Wrapper = styled.div`
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};

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
    label: 'Do you have a car?',
    loading: false,
    name: 'hasCar',
    description: 'This is a description',
    readOnly: false,
    required: true,
    disabled: false,
  },
} as Meta<SwitchProps>;

type FormFields = {
  hasCar: boolean;
};

export const OnSubmit: StoryFn<SwitchProps> = (args) => {
  const [value, setValue] = useState<boolean>();
  const { control, handleSubmit } = useForm<FormFields>();

  const onSubmit: SubmitHandler<FormFields> = ({ hasCar }) => {
    setValue(hasCar);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Switch
          name={args.name}
          label={args.label}
          control={control}
          description={args.description}
          hint={args.hint}
          loading={args.loading}
          disabled={args.disabled}
          required={args.required}
          readOnly={args.readOnly}
        />
        <Button type="submit">submit</Button>
      </form>
      submitted value: {value ? 'true' : 'false'}
    </>
  );
};

export const OnChange: StoryFn<SwitchProps> = (args) => {
  const { control } = useForm({ mode: 'onChange' });
  const switchValue = useWatch({ control, name: args.name });

  return (
    <>
      <Switch
        control={control}
        name={args.name}
        label={args.label}
        description={args.description}
        hint={args.hint}
        loading={args.loading}
        disabled={args.disabled}
        required={args.required}
        readOnly={args.readOnly}
      />
      <pre>value: {switchValue ? 'true' : 'false'}</pre>
    </>
  );
};
