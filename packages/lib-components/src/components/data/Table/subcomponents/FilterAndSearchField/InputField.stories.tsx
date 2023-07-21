import React from 'react';
import { Meta } from '@storybook/react';
import { InputField } from './InputField';

export default {
  title: 'Data/Table/InputField',
  component: InputField,
} as Meta;

export const InputFieldStory = () => {
  return <InputField />;
};
