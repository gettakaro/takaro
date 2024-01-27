import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Collapsible, CollapsibleProps } from '.';

export default {
  title: 'Other/Collapsible',
  component: Collapsible,
} as Meta<CollapsibleProps>;

export const Default: StoryFn<CollapsibleProps> = () => {
  return (
    <Collapsible>
      <Collapsible.Trigger>I am the trigger</Collapsible.Trigger>
      <Collapsible.Content>
        <div> I am a container showcasing the files</div>
      </Collapsible.Content>
    </Collapsible>
  );
};
