import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GenericSearchField, GenericSearchFieldProps, SearchFieldProps } from '.';

export default {
  title: 'Inputs/SearchField',
  component: GenericSearchField,
  args: {
    isLoading: false,
  },
} as Meta<GenericSearchFieldProps>;

export const Default: StoryFn<SearchFieldProps> = (args) => {
  const items = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
  ];

  const onChange = (e) => {
    console.log(e.target.value);
  };

  return (
    <GenericSearchField
      items={items}
      onChange={onChange}
      isLoading={args.isLoading}
      hasDescription={false}
      required={false}
      hasError={false}
      name="name"
      value=""
      id="name"
    />
  );
};
