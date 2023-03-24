import { Meta, StoryFn } from '@storybook/react';
import { CollapseList } from '.';

export default {
  title: 'Navigation/CollapseList',
  component: CollapseList,
} as Meta;

export const Default: StoryFn = (args) => {
  return (
    <CollapseList {...args}>
      <CollapseList.Item title="Files">
        <div> I am a container showcasing the files</div>
      </CollapseList.Item>
      <CollapseList.Item title="Settings">
        <div> I am a container showcasing the settings</div>
      </CollapseList.Item>
    </CollapseList>
  );
};
