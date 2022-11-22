// TODO: save images locally so when there is no network they are still loaded.
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Avatar, AvatarProps } from '.';
import { getInitials } from '../../../helpers';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

const placeholder01 = 'images/placeholder-01.jpeg';

export default {
  title: 'Data/Avatar',
  component: Avatar,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    size: 'md',
  },
} as Meta<AvatarProps>;

export const Default: StoryFn<AvatarProps> = (args) => (
  <Avatar alt="Harry Potter" {...args} src={placeholder01} />
);

export const Sizes: StoryFn = () => (
  <>
    <Avatar alt="Harry Potter" size="xs" src={placeholder01} />
    <Avatar alt="Harry Potter" size="sm" src={placeholder01} />
    <Avatar alt="Harry Potter" size="md" src={placeholder01} />
    <Avatar alt="Harry Potter" size="lg" src={placeholder01} />
    <Avatar alt="Harry Potter" size="xl" src={placeholder01} />
  </>
);

export const Initials: StoryFn = () => (
  <>
    <Avatar alt="Harry Potter" size="xs">
      {getInitials('Harry Potter')}
    </Avatar>
    <Avatar alt="Harry Potter" size="sm">
      {getInitials('Albus Severus Potter')}
    </Avatar>
    <Avatar alt="Harry Potter Vanmiet" size="md">
      {getInitials('James Sirius Potter ')}
    </Avatar>
    <Avatar alt="Harry Potter" size="lg">
      {getInitials('Lily Luna Potter')}
    </Avatar>
    <Avatar alt="Harry Potter" size="xl">
      {getInitials('Lily Luna Potter')}
    </Avatar>
  </>
);
