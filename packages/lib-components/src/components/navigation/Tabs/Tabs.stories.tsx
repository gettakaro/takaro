import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Tabs, TabsProps } from '.';
import { styled } from '../../../styled';
import { Empty, IconButton, Popover } from '../../../components';
import { AiOutlineTag as TagIcon } from 'react-icons/ai';

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
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

const InnerContent = styled.div`
  min-width: 600px;
`;

export const PopOver: StoryFn<TabsProps> = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <IconButton icon={<TagIcon />} onClick={() => setOpen(!open)} ariaLabel="open popover" />
      </Popover.Trigger>
      <Popover.Content>
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Local</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Lambda</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">
            <InnerContent>
              <Empty
                header="No local environment set up"
                description="You can set up a local environment by running the following command in your terminal:"
                actions={[]}
              />
            </InnerContent>
          </Tabs.Content>
          <Tabs.Content value="tab2">
            <InnerContent>
              <h3>Content 2</h3>
              <p>some long content here</p>
            </InnerContent>
          </Tabs.Content>
        </Tabs>
      </Popover.Content>
    </Popover>
  );
};

const EditorContent = styled.div`
  padding: ${({ theme }) => theme.spacing['2']};
`;

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

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
