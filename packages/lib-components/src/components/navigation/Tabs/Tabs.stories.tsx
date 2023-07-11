import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Tabs, TabsProps } from '.';

export default {
  title: 'Navigation/Tabs',
  component: Tabs,
  args: {
    placement: 'bottom',
  },
} as Meta<TabsProps>;

export const UnControlled: StoryFn<TabsProps> = () => (
  <Tabs>
    <Tabs.List>
      <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
      <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="tab1">Content 1</Tabs.Content>
    <Tabs.Content value="tab2">Content 2</Tabs.Content>
  </Tabs>
);
