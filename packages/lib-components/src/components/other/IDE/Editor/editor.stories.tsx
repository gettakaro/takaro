import { SandpackProvider } from '@codesandbox/sandpack-react';
import { Meta, StoryFn } from '@storybook/react';
import { Editor } from '.';

export default {
  title: 'Other/IDE/Editor',
  component: Editor
} as Meta;

export const Default: StoryFn = () => {
  return (
    <SandpackProvider template="vanilla-ts" >
      <Editor />
    </SandpackProvider>
  );
};
