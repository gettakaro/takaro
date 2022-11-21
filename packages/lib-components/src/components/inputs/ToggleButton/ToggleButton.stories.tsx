import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { ToggleButtonGroup, ToggleButton, ToggleButtonGroupProps } from '.';
import {
  MdOutlineFormatAlignLeft,
  MdOutlineFormatAlignRight,
  MdOutlineFormatAlignJustify,
  MdOutlineFormatAlignCenter,
} from 'react-icons/md';

const WrapperDecorator = styled.div`
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
`;

export default {
  title: 'Inputs/ToggleButton',
  component: ToggleButtonGroup,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>],
  subcomponents: { ToggleButton },
} as Meta<ToggleButtonGroupProps>;

export const Horizontal: StoryFn<ToggleButtonGroupProps> = () => {
  const handleOnChange = (value: string) => {
    console.log('handleOnChange fired', value);
  };

  return (
    <ToggleButtonGroup onChange={handleOnChange} exclusive>
      <ToggleButton value="left">
        <MdOutlineFormatAlignLeft size={20} />
      </ToggleButton>
      <ToggleButton value="center">
        <MdOutlineFormatAlignCenter size={20} />
      </ToggleButton>
      <ToggleButton value="right">
        <MdOutlineFormatAlignRight size={20} />
      </ToggleButton>
      <ToggleButton disabled value="justify">
        <MdOutlineFormatAlignJustify size={20} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Vertical: StoryFn<ToggleButtonGroupProps> = () => {
  const handleOnChange = (value: string) => {
    console.log('handleOnChange fired', value);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      orientation="vertical"
      exclusive
    >
      <ToggleButton value="left">
        <MdOutlineFormatAlignLeft size={20} />
      </ToggleButton>
      <ToggleButton value="center">
        <MdOutlineFormatAlignCenter size={20} />
      </ToggleButton>
      <ToggleButton value="right">
        <MdOutlineFormatAlignRight size={20} />
      </ToggleButton>
      <ToggleButton value="justify">
        <MdOutlineFormatAlignJustify size={20} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const FullWidth: StoryFn<ToggleButtonGroupProps> = () => {
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
      <ToggleButton value="left">
        <MdOutlineFormatAlignLeft size={20} />
      </ToggleButton>
      <ToggleButton value="center">
        <MdOutlineFormatAlignCenter size={20} />
      </ToggleButton>
      <ToggleButton value="right">
        <MdOutlineFormatAlignRight size={20} />
      </ToggleButton>
      <ToggleButton value="justify">
        <MdOutlineFormatAlignJustify size={20} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Text: StoryFn<ToggleButtonGroupProps> = () => {
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

export const NonExclusive: StoryFn<ToggleButtonGroupProps> = () => {
  const handleOnChange = (result: string | Map<string, boolean>) => {
    console.log('handleOnChange fired', result);
  };

  return (
    <ToggleButtonGroup
      onChange={handleOnChange}
      orientation="horizontal"
      exclusive={false}
    >
      <ToggleButton value="left">
        <MdOutlineFormatAlignLeft size={20} />
      </ToggleButton>
      <ToggleButton value="center">
        <MdOutlineFormatAlignCenter size={20} />
      </ToggleButton>
      <ToggleButton value="right">
        <MdOutlineFormatAlignRight size={20} />
      </ToggleButton>
      <ToggleButton value="justify">
        <MdOutlineFormatAlignJustify size={20} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
