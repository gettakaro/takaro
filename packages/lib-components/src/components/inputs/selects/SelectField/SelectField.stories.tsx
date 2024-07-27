import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Button, SelectField, SelectFieldProps } from '../../../../components';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { styled } from '../../../../styled';
import { films } from '../data';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ExtraStoryProps {
  optionGroupLabel: string;
}

export default {
  title: 'Inputs/SelectField',
  args: {
    label: 'Film',
    description: 'This is the description',
    hint: 'This is the hint',
    optionGroupLabel: 'Films',
    canClear: false,
    readOnly: false,
    disabled: false,
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
        canClear={args.canClear}
        name="film"
        hint={args.hint}
        readOnly={args.readOnly}
        disabled={args.disabled}
        render={(selectedItems) => {
          if (selectedItems.length === 0) {
            return <div>Select...</div>;
          }
          // selected items is an array { label: string, value: string }. In this case it will always only contain 1 value since we are not using multiSelect.
          const selectedFilm = films.find((film) => film.name === selectedItems[0]?.value);

          return (
            <div>
              {selectedFilm && <OptionIcon alt="Poster" src={selectedFilm?.icon} />}
              {selectedFilm?.name}
            </div>
          );
        }}
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
      <pre>result: {selectValue && selectValue.length > 0 && selectValue[0].value}</pre>
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
    [],
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
          canClear={args.canClear}
          label={args.label}
          description={args.description}
          render={(selectedItems) => {
            if (selectedItems.length === 0) {
              return <div>Select...</div>;
            }
            // selected items is an array { label: string, value: string }. In this case it will always only contain 1 value since we are not using multiSelect.
            const selectedFilm = films.find((film) => film.name === selectedItems[0]?.value);

            return (
              <div>
                {selectedFilm && <OptionIcon alt="Poster" src={selectedFilm?.icon} />}
                {selectedFilm?.name}
              </div>
            );
          }}
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

export const MultiSelect: StoryFn<SelectFieldProps> = (args) => {
  type FormFields = { film: string[] };
  const [result, setResult] = useState<string>('none');

  const validationSchema = useMemo(
    () =>
      z.object({
        film: z.string().array(),
      }),
    [],
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
          multiple
          canClear={args.canClear}
          description={args.description}
          render={(selectedItems) => {
            const selectedFilms = films.filter((film) => selectedItems.some((item) => item.value === film.name));

            return (
              <div>
                {selectedFilms.length === 0
                  ? 'Select...'
                  : selectedFilms.length <= 3
                    ? selectedFilms.map((film) => film.name).join(', ')
                    : `${selectedFilms
                        .slice(0, 3)
                        .map((film) => film.name)
                        .join(', ')} and ${selectedFilms.length - 3} more`}
              </div>
            );
          }}
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
        canClear={args.canClear}
        enableFilter
        render={(selectedItems) => {
          if (selectedItems.length === 0) {
            return <div>Select...</div>;
          }
          // selected items is an array { label: string, value: string }. In this case it will always only contain 1 value since we are not using multiSelect.
          const selectedFilm = films.find((film) => film.name === selectedItems[0]?.value);

          return (
            <div>
              {selectedFilm && <OptionIcon alt="Poster" src={selectedFilm?.icon} />}
              {selectedFilm?.name}
            </div>
          );
        }}
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
