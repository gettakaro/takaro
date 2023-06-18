import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useMemo, useState } from 'react';
import {
  Button,
  SelectProps,
  Select,
  OptionGroup,
  Option,
} from '../../../components';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { styled } from '../../../styled';
import { films } from './data';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default {
  title: 'Inputs/Select',
  args: {
    label: 'Film',
    description: 'This is the description',
    hint: 'This is the hint',
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

export const onChange: StoryFn<SelectProps> = (args) => {
  const { control } = useForm();
  const selectValue = useWatch({ control, name: 'film' });

  return (
    <>
      <Select
        description={args.description}
        label={args.label}
        control={control}
        name="film"
        hint={args.hint}
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
      <pre>result: {selectValue}</pre>
    </>
  );
};

export const OnSubmit: StoryFn<SelectProps> = (args) => {
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
      NOTE: You can ignore the width changing when opening the select. This is
      due to the select being rendered in a storybook iframe which has incorrect
      gutter size.
      <form onSubmit={handleSubmit(submit)}>
        <Select
          control={control}
          name="film"
          label={args.label}
          description={args.description}
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
      <pre>result: {result}</pre>
    </>
  );
};
