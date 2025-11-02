import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Tooltip, TooltipProps } from '.';
import { Button, IconButton } from '../../actions';
import { AiOutlineWoman as Icon } from 'react-icons/ai';

interface ExtraTooltipStoryProps {
  label: string;
}

export default {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  args: {
    placement: 'bottom',
    label: 'this is the tooltip content',
  },
} as Meta<TooltipProps & ExtraTooltipStoryProps>;

export const Default: StoryFn<TooltipProps & ExtraTooltipStoryProps> = (args) => (
  <>
    By default the tooltip is rendered in a div tag. This is because the tooltip component needs a ref to the trigger
    element. If you want to render the tooltip in a different element, you can use the asChild prop.
    <Tooltip placement={args.placement}>
      <Tooltip.Trigger asChild>trigger</Tooltip.Trigger>
      <Tooltip.Content>{args.label}</Tooltip.Content>
    </Tooltip>
  </>
);

export const UnControlled: StoryFn<TooltipProps & ExtraTooltipStoryProps> = (args) => (
  <Tooltip placement={args.placement}>
    <Tooltip.Trigger asChild>
      <span>trigger</span>
    </Tooltip.Trigger>
    <Tooltip.Content>{args.label}</Tooltip.Content>
  </Tooltip>
);

export const UnControlledCustomChild: StoryFn<TooltipProps & ExtraTooltipStoryProps> = (args) => (
  <>
    By default the component is rendered in a div tag. because the component is expected to have a ref. So if the
    component you want to render as the trigger does not have a ref, you can NOT set the asChild prop. By setting the
    asChild prop, the component will be rendered as the trigger component.
    <Tooltip>
      <Tooltip.Trigger asChild>
        <IconButton icon={<Icon />} ariaLabel="aria label here" />
      </Tooltip.Trigger>
      <Tooltip.Content>{args.label}</Tooltip.Content>
    </Tooltip>
  </>
);

export const Controlled: StoryFn<TooltipProps & ExtraTooltipStoryProps> = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      A controlled open means that the child component is responsible for opening and closing the tooltip. Which is e.g.
      useful when you want to open the tooltip on click instead of hover. or when you want to open a tooltip on a
      different component than the trigger.
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>I am the trigger</Tooltip.Trigger>
        <Tooltip.Content>controlled tooltip</Tooltip.Content>
      </Tooltip>
      <Button onClick={() => setOpen(true)}>open tooltip on, I am the trigger</Button>
    </>
  );
};
