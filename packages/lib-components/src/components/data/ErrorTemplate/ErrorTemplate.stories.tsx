import { Meta, StoryFn } from '@storybook/react';
import { ErrorTemplate, ErrorTemplateProps } from '.';

export default {
  title: 'Data/ErrorTemplate',
  component: ErrorTemplate,
  args: {
    description: 'NOT FOUND',
    title: '404',
  }
} as Meta<ErrorTemplateProps>;

export const Default: StoryFn<ErrorTemplateProps> = (args) => <ErrorTemplate {...args} />;
