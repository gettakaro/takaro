import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Button, SelectProps, Select } from '../../../components';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { styled } from '../../../styled';
import { films } from './data';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ExtraStoryProps {
  optionGroupLabel: string;
}

export default {
  title: 'Inputs/Select',
  args: {
    label: 'Film',
    description: 'This is the description',
    hint: 'This is the hint',
    optionGroupLabel: 'Films',
  },
} as Meta<SelectProps & ExtraStoryProps>;

const OptionIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 50%;
  background: #1d1e20;
  color: transparent;
`;

export const onChange: StoryFn<SelectProps & ExtraStoryProps> = (args) => {
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
            {films[selectedIndex] && <OptionIcon alt="Poster" src={films[selectedIndex]?.icon} />}
            {films[selectedIndex]?.name ?? 'Select...'}
          </div>
        )}
      >
        <Select.OptionGroup label={args.optionGroupLabel}>
          {films.map(({ name }) => (
            <Select.Option key={name} value={name}>
              <div>
                <span>{name}</span>
              </div>
            </Select.Option>
          ))}
        </Select.OptionGroup>
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
        film: z.enum(['not-sure-how-this-works', ...films.map((film) => film.name)]),
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
      NOTE: You can ignore the width changing when opening the select. This is due to the select being rendered in a
      storybook iframe which has incorrect gutter size.
      <form onSubmit={handleSubmit(submit)}>
        <Select
          control={control}
          name="film"
          label={args.label}
          description={args.description}
          render={(selectedIndex) => (
            <div>
              {films[selectedIndex] && <OptionIcon alt="Poster" src={films[selectedIndex]?.icon} />}
              {films[selectedIndex]?.name ?? 'Select...'}
            </div>
          )}
        >
          <Select.OptionGroup label="films">
            {films.map(({ name }) => (
              <Select.Option key={name} value={name}>
                <div>
                  <span>{name}</span>
                </div>
              </Select.Option>
            ))}
          </Select.OptionGroup>
        </Select>
        <Button type="submit" text="Submit" />
      </form>
      <pre>result: {result}</pre>
    </>
  );
};

export const MultiSelect: StoryFn<SelectProps> = (args) => {
  type FormFields = { film: string[] };
  const [result, setResult] = useState<string>('none');

  const validationSchema = useMemo(
    () =>
      z.object({
        film: z.string().array(),
      }),
    []
  );

  const { control, handleSubmit } = useForm<FormFields>({
    resolver: zodResolver(validationSchema),
  });

  const submit: SubmitHandler<FormFields> = ({ film }) => {
    setResult(film.join(', '));
  };

  return (
    <>
      NOTE: You can ignore the width changing when opening the select. This is due to the select being rendered in a
      storybook iframe which has incorrect gutter size.
      <form onSubmit={handleSubmit(submit)}>
        <Select
          control={control}
          name="film"
          label={args.label}
          multiSelect
          description={args.description}
          render={(selectedIndices) => (
            <div>
              {selectedIndices.length === 0
                ? 'Select...'
                : selectedIndices.length <= 3
                ? selectedIndices.map((index) => films[index]?.name).join(', ')
                : `${selectedIndices
                    .slice(0, 3)
                    .map((index) => films[index]?.name)
                    .join(', ')} and ${selectedIndices.length - 3} more`}
            </div>
          )}
        >
          <Select.OptionGroup label="films">
            {films.map(({ name }) => (
              <Select.Option key={name} value={name}>
                <div>
                  <span>{name}</span>
                </div>
              </Select.Option>
            ))}
          </Select.OptionGroup>
        </Select>
        <Button type="submit" text="Submit" />
      </form>
      <pre>result: {result}</pre>
    </>
  );
};

export const Filter: StoryFn<SelectProps & ExtraStoryProps> = (args) => {
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
        enableFilter
        render={(selectedIndex) => (
          <div>
            {films[selectedIndex] && <OptionIcon alt="Poster" src={films[selectedIndex]?.icon} />}
            {films[selectedIndex]?.name ?? 'Select...'}
          </div>
        )}
      >
        <Select.OptionGroup label={args.optionGroupLabel}>
          {films.map(({ name }) => (
            <Select.Option key={name} value={name}>
              <div>
                <span>{name}</span>
              </div>
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>
      <pre>result: {selectValue}</pre>
    </>
  );
};
