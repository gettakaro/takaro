import React from 'react';
import { Meta } from '@storybook/react';
import { FilterField, FilterFieldProps } from '.';

export default {
  title: 'Data/Table/FilterField',
  component: FilterField,
} as Meta<FilterFieldProps>;

export const Default = () => {
  return <FilterField data={['test', 'test2', 'test3', 'test4', 'test5']} />;
};
