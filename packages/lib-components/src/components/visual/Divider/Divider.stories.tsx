import { Meta, Story } from '@storybook/react';
import { Divider, DividerProps } from '.';

export default {
  title: 'Layout/Divider',
  component: Divider
} as Meta;

export const Default: Story<DividerProps> = () => (
  <div>
    <div>this is the content above</div>
    <Divider label={{ text: 'label', labelPosition: 'center' }} />
    <div> this is the content after</div>
  </div>
);
