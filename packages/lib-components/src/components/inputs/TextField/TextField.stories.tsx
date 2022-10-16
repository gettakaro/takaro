import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { TextField, FieldProps } from '../../inputs';
import { useForm, SubmitHandler } from 'react-hook-form';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 50%;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`;

export default {
  title: 'Inputs/TextField',
  component: TextField
} as Meta<FieldProps>;

export const Default: StoryFn<FieldProps> = () => {
  type FormFields = { name: string };
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      name: ''
    }
  });

  const onSubmit: SubmitHandler<FormFields> = () => {
    setResult(result);
  };

  return (
    <Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField control={control} label="Url" name="name" placeholder="takaro" />
        <TextField
          control={control}
          label="Url"
          name="name"
          placeholder="takaro"
          prefix="https://"
        />
        <TextField control={control} label="Url" name="name" placeholder="takaro" suffix=".com" />
        <TextField
          control={control}
          label="Url"
          name="name"
          placeholder="takaro"
          prefix="https://"
          suffix=".io"
        />
        <button type="submit">submit form</button>
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};
