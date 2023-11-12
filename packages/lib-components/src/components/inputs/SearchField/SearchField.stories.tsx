import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, SearchField, SearchFieldProps } from '../../../components';
import { films } from '../Select/data';

interface Film {
  name: string;
  decade: string;
  icon: string;
}

export default {
  title: 'Inputs/SearchField',
} as Meta<SearchFieldProps>;

export const ServerSideSubmit: StoryFn<SearchFieldProps> = () => {
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
        film.name.toLowerCase().trim().includes(debouncedValue.toLowerCase())
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
        <SearchField
          debounce={250}
          control={control}
          loading={loading}
          placeholder="Search for a film"
          label="Film"
          /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
          handleInputValueChange={mockAPICall}
          isLoadingData={loading}
          required={false}
          name="film"
        >
          {/* In this case the label is the same as the value but ofcourse that can differ*/}
          <SearchField.OptionGroup>
            {options?.map(({ name, icon }) => (
              <SearchField.Option key={name} value={name} label={name}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={icon} width="20px" height="20px" style={{ borderRadius: '50%', marginRight: '10px' }} />
                  <span>{name}</span>
                </div>
              </SearchField.Option>
            ))}
          </SearchField.OptionGroup>
        </SearchField>
        <Button type="submit" text="Submit form" />
      </form>
      This is the submitted value:
      <div>{result}</div>
    </>
  );
};

export const ClientSideSubmit: StoryFn<SearchFieldProps> = () => {
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
        <SearchField
          control={control}
          placeholder="Search for a film"
          label="Film"
          /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
          handleInputValueChange={handleInputChange}
          required={false}
          debounce={0}
          name="film"
        >
          {/* In this case the label is the same as the value but ofcourse that can differ*/}
          <SearchField.OptionGroup>
            {options?.map(({ name, icon, decade }) => (
              <SearchField.Option key={name} value={decade} label={name}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={icon} width="20px" height="20px" style={{ borderRadius: '50%', marginRight: '10px' }} />
                  <span>{name}</span>
                </div>
              </SearchField.Option>
            ))}
          </SearchField.OptionGroup>
        </SearchField>
        <Button type="submit" text="Submit form" />
      </form>
      The result returns the decade of the film:
      <div>{result}</div>
    </>
  );
};
