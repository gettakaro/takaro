import { Meta, Story } from '@storybook/react';
import { Tile, TileProps } from '.';

export default {
  title: 'Layout/Tile',
  component: Tile
} as Meta;

export const Default: Story<TileProps> = () => (
  <Tile bgColor="primary" description="description here" textColor="white" title="Title here" />
);
