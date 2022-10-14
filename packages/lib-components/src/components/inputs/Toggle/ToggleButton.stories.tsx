import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { ToggleButtonGroup, ToggleButton, ToggleButtonGroupProps } from '.';
import { MdOutlineFormatAlignLeft, MdOutlineFormatAlignRight, MdOutlineFormatAlignJustify, MdOutlineFormatAlignCenter } from 'react-icons/md';

const WrapperDecorator = styled.div`
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
`;

export default {
  title: 'Inputs/ToggleButton',
  component: ToggleButton,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>]
} as Meta;

export const Horizontal: Story<ToggleButtonGroupProps> = () => {
  const handleOnChange = (value: string) => {
    console.log('handleOnChange fired', value);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      exclusive
    >
      <ToggleButton value="left"><MdOutlineFormatAlignLeft size={20} /></ToggleButton>
      <ToggleButton value="center"><MdOutlineFormatAlignCenter size={20} /></ToggleButton>
      <ToggleButton value="right"><MdOutlineFormatAlignRight size={20} /></ToggleButton>
      <ToggleButton disabled value="justify"><MdOutlineFormatAlignJustify size={20} /></ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Vertical: Story<ToggleButtonGroupProps> = () => {
  const handleOnChange = (value: string) => {
    console.log('handleOnChange fired', value);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      orientation="vertical"
      exclusive
    >
      <ToggleButton value="left"><MdOutlineFormatAlignLeft size={20} /></ToggleButton>
      <ToggleButton value="center"><MdOutlineFormatAlignCenter size={20} /></ToggleButton>
      <ToggleButton value="right"><MdOutlineFormatAlignRight size={20} /></ToggleButton>
      <ToggleButton value="justify"><MdOutlineFormatAlignJustify size={20} /></ToggleButton>
    </ToggleButtonGroup>
  );
};

export const FullWidth: Story<ToggleButtonGroupProps> = () => {
  const handleOnChange = (value: string) => {
    console.log('handleOnChange fired', value);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      orientation="horizontal"
      fullWidth
      exclusive
    >
      <ToggleButton value="left"><MdOutlineFormatAlignLeft size={20} /></ToggleButton>
      <ToggleButton value="center"><MdOutlineFormatAlignCenter size={20} /></ToggleButton>
      <ToggleButton value="right"><MdOutlineFormatAlignRight size={20} /></ToggleButton>
      <ToggleButton value="justify"><MdOutlineFormatAlignJustify size={20} /></ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Text: Story<ToggleButtonGroupProps> = () => {
  const handleOnChange = (value: string) => {
    console.log('handleOnChange fired', value);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      orientation="horizontal"
      exclusive
    >
      <ToggleButton value="left">left</ToggleButton>
      <ToggleButton value="center">center</ToggleButton>
      <ToggleButton value="right">right</ToggleButton>
      <ToggleButton value="justify">justify</ToggleButton>
    </ToggleButtonGroup>
  );
};

export const NonExclusive: Story<ToggleButtonGroupProps> = () => {
  const handleOnChange = (result: Map<string, boolean>) => {
    console.log('handleOnChange fired', result);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      orientation="horizontal"
      exclusive={false}
    >
      <ToggleButton value="left"><MdOutlineFormatAlignLeft size={20} /></ToggleButton>
      <ToggleButton value="center"><MdOutlineFormatAlignCenter size={20} /></ToggleButton>
      <ToggleButton value="right"><MdOutlineFormatAlignRight size={20} /></ToggleButton>
      <ToggleButton value="justify"><MdOutlineFormatAlignJustify size={20} /></ToggleButton>
    </ToggleButtonGroup>
  );
};
