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
} as Meta<HorizontalNavProps>;

export const Default: StoryFn = () => {
  return (
    <Container>
      <HorizontalNav
        items={[
          {
            text: 'option1',
            to: '/option1',
          },
          {
            text: 'option2',
            to: '/option2',
          },
          {
            text: 'option3',
            to: '/option3',
          },
        ]}
      />
    </Container>
  );
};
