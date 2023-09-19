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
  const [value, setValue] = React.useState<string>();

  const items = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
  ];
  const [options, setOptions] = React.useState<typeof items>(items);

  const onChange = (selectedValue: string) => {
    setValue(selectedValue);

    if (selectedValue.length > 0) {
      setOptions(items.filter((item) => item.label.includes(selectedValue)));
    }
  };

  return (
    <>
      <GenericSearchField
        items={options}
        onChange={onChange}
        isLoading={args.isLoading}
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
