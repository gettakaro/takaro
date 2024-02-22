import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { Filter, FilterInputType, FilterProps } from '.';

export default {
  title: 'Actions/Filter',
  component: Filter,
} as Meta<FilterProps>;

export const Default: StoryFn = () => {
  const fields = [
    {
      name: 'id',
      type: FilterInputType.uuid,
    },
    {
      name: 'name',
      type: FilterInputType.string,
    },
    {
      name: 'createdAt',
      type: FilterInputType.datetime,
    },
  ];

  return <Filter filterFields={fields} />;
};
