import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GenericSearchField, GenericSearchFieldProps, SearchFieldProps } from '.';
import { SearchFieldItem } from './Generic';

export default {
  title: 'Inputs/SearchField',
  component: GenericSearchField,
  args: {
    isLoading: false,
  },
} as Meta<GenericSearchFieldProps>;

export const Default: StoryFn<SearchFieldProps> = () => {
  const [value, setValue] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const items = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
  ];
  const [options, setOptions] = React.useState<typeof items>(items);

  // Function to handle the simulated API call
  const handleSearch = (debouncedValue) => {
    // Start loading
    setLoading(true);

    // Simulate an API call with a timeout
    setTimeout(() => {
      // Simulate filtering data from an API response
      const filteredItems = items.filter((item) => item.label.toLowerCase().includes(debouncedValue.toLowerCase()));

      // Set the filtered options
      setOptions(filteredItems);

      // Stop loading
      setLoading(false);
    }, 1000); // Simulate 1 second API call delay
  };

  // Debounce the search to avoid unnecessary API calls
  // This function will be called each time the input changes
  const onChange = (debouncedValue) => {
    if (debouncedValue.length > 0) {
      handleSearch(debouncedValue);
    } else {
      // If the input is cleared, reset options to the full list
      setOptions(items);
    }
  };

  const onSelectionChange = (item: SearchFieldItem) => {
    setValue(item.label);
  };

  return (
    <>
      <GenericSearchField
        items={options}
        /* The onChange returns the not debounced value, probably never needed, but is inherited by all inputFields */
        onChange={() => {}}
        handleOnChange={onChange}
        handleOnSelect={(item) => onSelectionChange(item)}
        isLoading={loading}
        hasDescription={false}
        required={false}
        hasError={false}
        name="name"
        value=""
        id="name"
      />
      <div>{value}</div>
    </>
  );
};
