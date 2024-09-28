import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Card, CardProps } from '.';

export default {
  title: 'Layout/Card',
  component: Card,
  args: {
    variant: 'default',
  },
} as Meta<CardProps>;

export const Default: StoryFn<CardProps> = (args) => {
  return (
    <Card variant={args.variant} onClick={() => {}}>
      <Card.Title label="This is the title">
        <span>Here we can put logic that goes on the right side</span>
      </Card.Title>
      <Card.Body>this is the body</Card.Body>
    </Card>
  );
};
