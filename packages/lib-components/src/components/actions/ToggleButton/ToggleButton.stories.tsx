import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { ToggleButtonGroup, ToggleButtonGroupProps } from '.';
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
  title: 'Actions/ToggleButton',
  component: ToggleButtonGroup,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>],
  args: {
    exclusive: true,
    orientation: 'horizontal',
    defaultValue: 'left',
    fullWidth: false,
  },
} as Meta<ToggleButtonGroupProps>;

export const Default: StoryFn<ToggleButtonGroupProps> = (args) => {
  const [value, setValue] = useState<string>();

  const handleOnChange = (newValue: string) => {
    setValue(newValue);
  };

  return (
    <>
      <ToggleButtonGroup
        onChange={(val) => handleOnChange(val as string)}
        exclusive={args.exclusive}
        orientation={args.orientation}
        fullWidth={args.fullWidth}
      >
        <ToggleButtonGroup.Button value="left">
          <MdOutlineFormatAlignLeft size={17} />
        </ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button value="center">
          <MdOutlineFormatAlignCenter size={17} />
        </ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button value="right">
          <MdOutlineFormatAlignRight size={17} />
        </ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button disabled value="justify">
          <MdOutlineFormatAlignJustify size={17} />
        </ToggleButtonGroup.Button>
      </ToggleButtonGroup>
      <pre>{value}</pre>
    </>
  );
};

export const Text: StoryFn<ToggleButtonGroupProps> = (args) => {
  const [value, setValue] = useState<string>();

  const handleOnChange = (newValue: string) => {
    setValue(newValue);
  };
  return (
    <>
      <ToggleButtonGroup
        onChange={(val) => handleOnChange(val as string)}
        orientation={args.orientation}
        exclusive={args.exclusive}
        fullWidth={args.fullWidth}
      >
        <ToggleButtonGroup.Button value="left">left</ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button value="center">center</ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button value="right">right</ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button value="justify">justify</ToggleButtonGroup.Button>
      </ToggleButtonGroup>
      <pre>{value}</pre>
    </>
  );
};
