import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { ContextMenu, ContextMenuProps } from '.';

const Container = styled.div`
  background-color: orange;
`;

export default {
  title: 'Actions/ContextMenu',
  component: ContextMenu,
} as Meta<ContextMenuProps>;

export const Default: StoryFn<ContextMenuProps> = () => {
  return (
    <Container>
      Right click me to open the context menu
      <ContextMenu>
        <ContextMenu.Item label="Item 1" />
        <ContextMenu.Item label="Item 2" />
        <ContextMenu.Item label="Item 3" />
      </ContextMenu>
    </Container>
  );
};
