import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Button } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { styled } from '../../../styled';
import { Select, SelectProps, Option, OptionGroup } from './index';
import { films } from './data';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default {
  title: 'Inputs/Select',
  args: {
    label: 'Film',
  },
} as Meta<SelectProps>;

const OptionIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 50%;
  background: #1d1e20;
  color: transparent;
`;

export const Default: StoryFn<SelectProps> = (args) => {
  type FormFields = { film: string };
  const [result, setResult] = useState<string>('none');

  const validationSchema = useMemo(
    () =>
      z.object({
        film: z.enum([
          'not-sure-how-this-works',
          ...films.map((film) => film.name),
        ]),
      }),
    []
  );

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
  });

  const submit: SubmitHandler<FormFields> = ({ film }) => {
    setResult(film);
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <Select
          control={control}
          name="film"
          label={args.label}
          render={(selectedIndex) => (
            <div>
              {films[selectedIndex] && (
                <OptionIcon alt="Poster" src={films[selectedIndex]?.icon} />
              )}
              {films[selectedIndex]?.name ?? 'Select...'}
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
        <Button type="submit" text="Submit" />
      </form>
      <span>result: {result}</span>
    </>
  );
};
