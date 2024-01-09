import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Avatar, AvatarGroupProps, AvatarProps } from '.';
import { getInitials } from '../../../helpers';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
`;

const placeholder01 = 'images/placeholder-01.jpeg';
const placeholder02 = 'images/placeholder-02.jpeg';
const placeholder03 = 'images/placeholder-03.jpeg';

export default {
  title: 'Data/Avatar',
  component: Avatar,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    size: 'medium',
    unstackOnHover: false,
    max: 3,
  },
} as Meta<AvatarProps & AvatarGroupProps>;

export const Default: StoryFn<AvatarProps> = (args) => (
  <Avatar size={args.size}>
    <Avatar.Image src={placeholder01} />
    <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
  </Avatar>
);

export const Fallback: StoryFn = () => (
  <>
    <Avatar size="tiny">
      <Avatar.Image src="/broken" />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size="small">
      <Avatar.Image src="/broken" />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size="medium">
      <Avatar.Image src="/broken" />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size="large">
      <Avatar.Image src="/broken" />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size="huge">
      <Avatar.Image src="/broken" />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
  </>
);
export const Group: StoryFn<AvatarProps & AvatarGroupProps> = (args) => (
  <Avatar.Group max={args.max} unstackOnHover={args.unstackOnHover}>
    <Avatar size={args.size}>
      <Avatar.Image src={placeholder01} />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size={args.size}>
      <Avatar.Image src={placeholder02} />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size={args.size}>
      <Avatar.Image src={placeholder03} />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size={args.size}>
      <Avatar.Image src={placeholder01} />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
    <Avatar size={args.size}>
      <Avatar.Image src={placeholder02} />
      <Avatar.FallBack>{getInitials('Harry Potter')}</Avatar.FallBack>
    </Avatar>
  </Avatar.Group>
);
