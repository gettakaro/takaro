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
    variant: 'clear',
  },
} as Meta<HorizontalNavProps>;

export const Default: StoryFn<HorizontalNavProps> = ({ variant }) => {
  return (
    <Container>
      <HorizontalNav variant={variant}>
        <a>overview</a>
        <a>analytics</a>
        <a>reports</a>
      </HorizontalNav>
    </Container>
  );
};
