import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { styled } from '../../../styled';
import { Select, SelectProps, Option, OptionGroup } from './index';
import { films } from './data';

export default {
  title: 'Inputs/Select',
} as Meta<SelectProps>;

const OptionIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 50%;
  background: #1d1e20;
  color: transparent;
`;

export const Default: StoryFn<SelectProps> = () => {
  type FormFields = { film: string };
  const [result, setResult] = useState<string>('none');
  const { control, handleSubmit } = useForm<FormFields>();

  const submit: SubmitHandler<FormFields> = ({ film }) => {
    console.log(film);
    setResult(film);
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <Select
          control={control}
          name="film"
          render={(selectedIndex) => (
            <div>
              {films[selectedIndex] ? (
                <OptionIcon alt="Poster" src={films[selectedIndex]?.icon} />
              ) : null}
              {films[selectedIndex]?.name ?? 'Select...'}{' '}
            </div>
          )}
        >
          <OptionGroup label="films">
            {films.map(({ name }) => (
              <Option key={name} value={name}>
                <div>
                  <span>{name}</span>
                </div>
              </Option>
            ))}
          </OptionGroup>
        </Select>
        <Button
          type="submit"
          onClick={() => {
            /* placeholder */
          }}
          text="Submit"
        />
      </form>
      <span>result: {result}</span>
    </>
  );
};
