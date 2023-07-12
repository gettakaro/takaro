import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Tabs, TabsProps } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
`;

const EditorContent = styled.div`
  padding: ${({ theme }) => theme.spacing['2']};
`;

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

export default {
  title: 'Navigation/Tabs',
  component: Tabs,
  args: {
    placement: 'bottom',
  },
} as Meta<TabsProps>;

export const UnControlled: StoryFn<TabsProps> = () => (
  <Wrapper>
    <Tabs defaultValue="tab1">
      <Tabs.List>
        <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <h1>Content 1</h1>
        <p>some long content here</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <h1>Content 2</h1>
        <p>some long content here</p>
      </Tabs.Content>
    </Tabs>
  </Wrapper>
);

export const Editor: StoryFn<TabsProps> = () => {
  return (
    <Container>
      <Tabs defaultValue="hello-world.ts">
        <Tabs.List>
          <Tabs.Trigger value="hello-world.ts">hello-world.ts</Tabs.Trigger>
          <Tabs.Trigger value="hello-world.test.ts">hello-world.test.ts</Tabs.Trigger>
          <Tabs.Trigger value="tsconfig.json">tsconfig.json</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="hello-world.ts">
          <EditorContent>
            <h1>hello-world.ts</h1>
            <p>some long content here</p>
          </EditorContent>
        </Tabs.Content>
        <Tabs.Content value="hello-world.test.ts">
          <EditorContent>
            <pre>
              <code>const helloWorld = 'hello world'</code>
            </pre>
          </EditorContent>
        </Tabs.Content>
        <Tabs.Content value="tsconfig.json">
          <EditorContent>
            <pre>
              <code>const helloWorld = 'hello world'</code>
            </pre>
          </EditorContent>
        </Tabs.Content>
      </Tabs>
    </Container>
  );
};
