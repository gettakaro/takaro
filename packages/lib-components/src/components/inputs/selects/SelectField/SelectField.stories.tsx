import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Button, SelectField, SelectFieldProps } from '../../../../components';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { styled } from '../../../../styled';
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
} as Meta<SelectFieldProps & ExtraStoryProps>;

const OptionIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 50%;
  background: #1d1e20;
  color: transparent;
`;

export const onChange: StoryFn<SelectFieldProps & ExtraStoryProps> = (args) => {
  const { control } = useForm();
  const selectValue = useWatch({ control, name: 'film' });

  return (
    <>
      <SelectField
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
        <SelectField.OptionGroup label={args.optionGroupLabel}>
          {films.map(({ name }) => (
            <SelectField.Option key={name} value={name}>
              <div>
                <span>{name}</span>
              </div>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>
      <pre>result: {selectValue}</pre>
    </>
  );
};

export const OnSubmit: StoryFn<SelectFieldProps> = (args) => {
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
        <SelectField
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
          <SelectField.OptionGroup label="films">
            {films.map(({ name }) => (
              <SelectField.Option key={name} value={name}>
                <div>
                  <span>{name}</span>
                </div>
              </SelectField.Option>
            ))}
          </SelectField.OptionGroup>
        </SelectField>
        <Button type="submit" text="Submit" />
      </form>
      <pre>result: {result}</pre>
    </>
  );
};

export const MultiSelect: StoryFn<SelectFieldProps> = (args) => {
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
        <SelectField
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
          <SelectField.OptionGroup label="films">
            {films.map(({ name }) => (
              <SelectField.Option key={name} value={name} label={name}>
                <div>
                  <span>{name}</span>
                </div>
              </SelectField.Option>
            ))}
          </SelectField.OptionGroup>
        </SelectField>
        <Button type="submit" text="Submit" />
      </form>
      <pre>result: {result}</pre>
    </>
  );
};

export const Filter: StoryFn<SelectFieldProps & ExtraStoryProps> = (args) => {
  const { control } = useForm();
  const selectValue = useWatch({ control, name: 'film' });

  return (
    <>
      <SelectField
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
        <SelectField.OptionGroup label={args.optionGroupLabel}>
          {films.map(({ name }) => (
            <SelectField.Option key={name} value={name} label={name}>
              <div>
                <span>{name}</span>
              </div>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>
      <pre>result: {selectValue}</pre>
    </>
  );
};
