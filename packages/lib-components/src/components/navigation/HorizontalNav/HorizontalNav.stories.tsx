import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { HorizontalNav, HorizontalNavProps } from '.';
import { styled } from '../../../styled';

const Container = styled.div`
  display: flex;
  width: 100vw;
`;

export default {
  title: 'Navigation/HorizontalNav',
  component: HorizontalNav,
  args: {
    variant: 'underline',
  },
} as Meta<HorizontalNavProps>;

export const Default: StoryFn<HorizontalNavProps> = ({ variant }) => {
  return (
    <Container>
      <HorizontalNav
        variant={variant}
        items={[
          {
            text: 'overview',
            to: '/option1',
          },
          {
            text: 'analytics',
            to: '/option2',
          },
          {
            text: 'reports',
            to: '/option3',
          },
          {
            text: 'Notifications',
            to: '/option4',
          },
        ]}
      />
    </Container>
  );
};
