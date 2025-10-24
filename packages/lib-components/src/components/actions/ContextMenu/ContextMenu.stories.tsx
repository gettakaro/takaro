import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { ContextMenu, ContextMenuProps } from '.';

const Container = styled.div`
  border: 1px solid orange;
`;

export default {
  title: 'Actions/ContextMenu',
  component: ContextMenu,
} as Meta<ContextMenuProps>;

export const Document: StoryFn<ContextMenuProps> = () => {
  return (
    <Container>
      The context menu does not receive a targetRef prop, so it is triggered on the entire document.
      <ContextMenu>
        <ContextMenu.Item label="Item 1" />
        <ContextMenu.Item label="Item 2" />
        <ContextMenu.Item label="Item 3" />
      </ContextMenu>
    </Container>
  );
};

export const Target: StoryFn<ContextMenuProps> = () => {
  const targetRef = React.useRef<HTMLDivElement>(null);

  return (
    <Container ref={targetRef}>
      The context menu has a targetRef prop, so it is only triggered on the orange box.
      <ContextMenu targetRef={targetRef}>
        <ContextMenu.Item label="Item 1" />
        <ContextMenu.Item label="Item 2" />
        <ContextMenu.Item label="Item 3" />
      </ContextMenu>
    </Container>
  );
};
