import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { IconNav } from '.';
import type { IconNavProps } from '.';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
} from 'react-icons/ai';
import { styled } from '../../../styled';

const Container = styled.div`
  display: flex;
  width: 100vw;
`;

export default {
  title: 'Navigation/IconNav',
  component: IconNav,
} as Meta<IconNavProps>;

export const Default: StoryFn = () => {
  return (
    <Container>
      <IconNav
        items={[
          {
            title: 'option1',
            to: '/option1',
            icon: <DashboardIcon />,
          },
          {
            title: 'option2',
            to: '/option2',
            icon: <SettingsIcon />,
          },
          {
            title: 'option3',
            to: '/option3',
            icon: <ModulesIcon />,
          },
        ]}
      />
    </Container>
  );
};
