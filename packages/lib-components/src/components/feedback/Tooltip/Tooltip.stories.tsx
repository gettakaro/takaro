import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Tooltip, TooltipProps } from '.';
import { IconButton } from '../../actions';
import { AiOutlineWoman as Icon } from 'react-icons/ai';

interface ExtraTooltipStoryProps {
  label: string;
}

export default {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  args: {
    placement: 'bottom',
  },
} as Meta<TooltipProps & ExtraTooltipStoryProps>;

export const UnControlled: StoryFn<TooltipProps & ExtraTooltipStoryProps> = (
  args
) => (
  <Tooltip placement={args.placement}>
    <Tooltip.Trigger>
      <span>trigger</span>
    </Tooltip.Trigger>
    <Tooltip.Content>tooltip content here</Tooltip.Content>
  </Tooltip>
);

export const UnControlledCustomChild: StoryFn<
  TooltipProps & ExtraTooltipStoryProps
> = () => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <IconButton icon={<Icon />} />
    </Tooltip.Trigger>
    <Tooltip.Content>tooltip content here</Tooltip.Content>
  </Tooltip>
);

export const Controlled: StoryFn<TooltipProps & ExtraTooltipStoryProps> =
  () => {
    const [open, setOpen] = useState(false);
    return (
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger>component here</Tooltip.Trigger>
        <Tooltip.Content>controlled tooltip</Tooltip.Content>
      </Tooltip>
    );
  };
