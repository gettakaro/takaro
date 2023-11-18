import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Popover, PopoverProps } from '.';
import { IconButton } from '../../actions';
import { AiFillBug as BugIcon } from 'react-icons/ai';

export default {
  title: 'Feedback/Popover',
  component: Popover,
  args: {
    placement: 'bottom',
  },
} as Meta<PopoverProps>;

export const UnControlled: StoryFn<PopoverProps> = () => (
  <Popover>
    <Popover.Trigger>Click this to open it in the popover</Popover.Trigger>
    <Popover.Content>this is the content of the popover</Popover.Content>
  </Popover>
);

export const CustomTrigger: StoryFn<PopoverProps> = () => (
  <>
    By default trigger is rendered as a button, but you can pass any component as a trigger by setting the asChild prop
    on the Popover.Trigger component.
    <Popover>
      <Popover.Trigger asChild>
        <IconButton icon={<BugIcon />} ariaLabel="click me" />
      </Popover.Trigger>
      <Popover.Content>this is the content of the popover</Popover.Content>
    </Popover>
  </>
);
