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
  <>
    By default the component is rendered in a div tag. because the component is
    expected to have a ref. So if the component you want to render as the
    trigger does not have a ref, you can NOT set the asChild prop. By setting
    the asChild prop, the component will be rendered as the trigger component.
    <Tooltip>
      <Tooltip.Trigger asChild>
        <IconButton icon={<Icon />} />
      </Tooltip.Trigger>
      <Tooltip.Content>tooltip content here</Tooltip.Content>
    </Tooltip>
  </>
);

export const Controlled: StoryFn<TooltipProps & ExtraTooltipStoryProps> =
  () => {
    const [open, setOpen] = useState<boolean>(false);

    return (
      <>
        A controlled open means that the child component is responsible for
        opening and closing the tooltip. Which is e.g. useful when you want to
        open the tooltip on click instead of hover. or when you want to open a
        tooltip on a different component than the trigger.
        <Tooltip open={open} onOpenChange={setOpen}>
          <Tooltip.Trigger>I am the trigger</Tooltip.Trigger>
          <Tooltip.Content>controlled tooltip</Tooltip.Content>
        </Tooltip>
        <Button
          onClick={() => setOpen(true)}
          text="open tooltip on, I am the trigger"
        />
      </>
    );
  };
