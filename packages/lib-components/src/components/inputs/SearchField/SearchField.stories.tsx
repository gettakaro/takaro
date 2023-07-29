import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SearchField, SearchFieldProps } from '.';

export default {
  title: 'Inputs/SearchField',
} as Meta<SearchFieldProps>;

export const Default: StoryFn<SearchFieldProps> = () => {
  const items = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
  ];

  const onChange = (value: string) => {
    console.log(value);
  };

  return <SearchField items={items} onChange={onChange} />;
};
