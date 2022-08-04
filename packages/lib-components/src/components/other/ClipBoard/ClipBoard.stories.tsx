import { Meta, Story } from '@storybook/react';
import { ClipBoard, ClipBoardProps } from '.';

export default {
  title: 'Other/ClipBoard',
  component: ClipBoard
} as Meta;

const Template: Story<ClipBoardProps> = (args) => <ClipBoard {...args} />;
export const Default = Template.bind({});
Default.args = {
  text: 'https://docs.csmm.app/en/CSMM/advanced-feature-guide-chathook.html#creating-the-listen-hook-for-specific-content-in-a-chatmessage',
  maxWidth: 300
};
