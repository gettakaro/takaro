import { Meta, StoryFn } from '@storybook/react';
import { Tile, TileProps } from '.';

export default {
  title: 'Layout/Tile',
  component: Tile,
  args: {
    bgColor: 'primary',
    description: 'description here',
    textColor: 'white',
    title: 'title here',
  },
} as Meta<TileProps>;

export const Default: StoryFn<TileProps> = (args) => <Tile {...args} />;
