import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, SelectQueryField, SelectQueryFieldProps } from '../../../../components';
import { films } from '../data';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GenericSelectQueryField } from './Generic';

interface Film {
  name: string;
  decade: string;
  icon: string;
}

export default {
  title: 'Inputs/SelectQueryField',
  args: {
    placeholder: 'Search for a film',
    label: 'Film',
    debounce: 250,
    readOnly: false,
    canClear: false,
  },
} as Meta<SelectQueryFieldProps>;

export const ServerSideSubmit: StoryFn<SelectQueryFieldProps> = (args) => {
  interface FormValues {
    film: string;
  }

  const { control, handleSubmit } = useForm<FormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Film[]>();
  const [result, setResult] = useState<string>('');

  // Function to handle the simulated API call
  // This function will be called each time the input changes
  const mockAPICall = (debouncedValue: string) => {
    // Start loading
    setLoading(true);

    setTimeout(() => {
      const filteredOptions = films.filter((film) =>
        film.name.toLowerCase().trim().includes(debouncedValue.toLowerCase()),
      );
      setOptions(filteredOptions);
      setLoading(false);
    }, 1000);
  };

  const onSubmit: SubmitHandler<FormValues> = ({ film }) => {
    setResult(film);
  };

  return (
    <>
      it is important to note that it is required for the user to select an option from the list. If the user types
      something, but does not select an item from the list, the input will be reset.
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectQueryField
          debounce={args.debounce}
          control={control}
          loading={loading}
          canClear={args.canClear}
          placeholder={args.placeholder}
          label={args.placeholder}
          /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
          handleInputValueChange={mockAPICall}
          isLoadingData={loading}
          required={false}
          hasNextPage={false}
          optionCount={10}
          isFetching={false}
          isFetchingNextPage={false}
          fetchNextPage={() => {}}
          name="film"
        >
          {/* In this case the label is the same as the value but ofcourse that can differ*/}
          <SelectQueryField.OptionGroup>
            {options?.map(({ name, icon }) => (
              <SelectQueryField.Option key={name} value={name} label={name}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={icon} width="20px" height="20px" style={{ borderRadius: '50%', marginRight: '10px' }} />
                  <span>{name}</span>
                </div>
              </SelectQueryField.Option>
            ))}
          </SelectQueryField.OptionGroup>
        </SelectQueryField>
        <Button type="submit">Submit form</Button>
      </form>
      This is the submitted value:
      <div>{result}</div>
    </>
  );
};

export const ClientSideSubmit: StoryFn<SelectQueryFieldProps> = (args) => {
  interface FormValues {
    film: string;
  }

  const { control, handleSubmit } = useForm<FormValues>();
  const [options, setOptions] = useState<Film[]>();
  const [result, setResult] = useState<string>('');

  // Function to handle the simulated API call
  // This function will be called each time the input changes
  const handleInputChange = (value: string) => {
    // Start loading
    const filteredOptions = films.filter((film) => film.name.toLowerCase().trim().includes(value.toLowerCase()));
    setOptions(filteredOptions);
  };

  const onSubmit: SubmitHandler<FormValues> = ({ film }) => {
    setResult(film);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectQueryField
          control={control}
          placeholder="Search for a film"
          label="Film"
          canClear={args.canClear}
          /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
          handleInputValueChange={handleInputChange}
          required={false}
          debounce={0}
          hasNextPage={false}
          optionCount={10}
          isFetching={false}
          isFetchingNextPage={false}
          fetchNextPage={() => {}}
          name="film"
        >
          {/* In this case the label is the same as the value but ofcourse that can differ*/}
          <SelectQueryField.OptionGroup>
            {options?.map(({ name, icon, decade }) => (
              <SelectQueryField.Option key={name} value={decade} label={name}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={icon} width="20px" height="20px" style={{ borderRadius: '50%', marginRight: '10px' }} />
                  <span>{name}</span>
                </div>
              </SelectQueryField.Option>
            ))}
          </SelectQueryField.OptionGroup>
        </SelectQueryField>
        <Button type="submit">Submit form</Button>
      </form>
      The result returns the decade of the film:
      <div>{result}</div>
    </>
  );
};

export const ClientSideMultiSelectSubmit: StoryFn<SelectQueryFieldProps> = (args) => {
  interface FormValues {
    films: string[];
  }

  const validationSchema = z.object({
    films: z.array(z.string()).nonempty(),
  });

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });
  const [options, setOptions] = useState<Film[]>();
  const [result, setResult] = useState<string[]>([]);

  // Function to handle the simulated API call
  // This function will be called each time the input changes
  const handleInputChange = (value: string) => {
    // Start loading
    const filteredOptions = films.filter((film) => film.name.toLowerCase().trim().includes(value.toLowerCase()));
    setOptions(filteredOptions);
  };

  const onSubmit: SubmitHandler<FormValues> = ({ films }) => {
    if (films && films.length === 0) return;
    setResult(films);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectQueryField
          control={control}
          placeholder="Search for a film"
          label="Film"
          /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
          handleInputValueChange={handleInputChange}
          required={false}
          canClear={args.canClear}
          debounce={0}
          hasNextPage={false}
          optionCount={10}
          isFetching={false}
          isFetchingNextPage={false}
          fetchNextPage={() => {}}
          multiple
          name="films"
        >
          {/* In this case the label is the same as the value but ofcourse that can differ*/}
          <SelectQueryField.OptionGroup>
            {options?.map(({ name, icon }) => (
              <SelectQueryField.Option key={name} value={name} label={name}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={icon} width="20px" height="20px" style={{ borderRadius: '50%', marginRight: '10px' }} />
                  <span>{name}</span>
                </div>
              </SelectQueryField.Option>
            ))}
          </SelectQueryField.OptionGroup>
        </SelectQueryField>
        <Button type="submit">Submit form</Button>
      </form>
      Selected films:
      <div>{result && result.join(',')}</div>
    </>
  );
};

export const Generic: StoryFn<SelectQueryFieldProps> = () => {
  const [options, setOptions] = useState<Film[]>();
  const [result, setResult] = useState<string[]>([]);

  // Function to handle the simulated API call
  // This function will be called each time the input changes
  const handleInputChange = (value: string) => {
    // Start loading
    const filteredOptions = films.filter((film) => film.name.toLowerCase().trim().includes(value.toLowerCase()));
    setOptions(filteredOptions);
  };

  const onChange = (values: string[]) => {
    setResult(values);
  };

  return (
    <>
      <GenericSelectQueryField
        id="films"
        onChange={onChange}
        placeholder="Search for a film"
        /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
        handleInputValueChange={handleInputChange}
        required={false}
        debounce={0}
        multiple
        hasError={false}
        hasDescription={false}
        value={result}
        name="film"
        hasNextPage={false}
        optionCount={10}
        isFetching={false}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
      >
        {/* In this case the label is the same as the value but ofcourse that can differ*/}
        <SelectQueryField.OptionGroup>
          {options?.map(({ name, icon }) => (
            <SelectQueryField.Option key={name} value={name} label={name}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={icon} width="20px" height="20px" style={{ borderRadius: '50%', marginRight: '10px' }} />
                <span>{name}</span>
              </div>
            </SelectQueryField.Option>
          ))}
        </SelectQueryField.OptionGroup>
      </GenericSelectQueryField>
      Selected films:
      <div>{result.map((film) => film).join(',')}</div>
    </>
  );
};
