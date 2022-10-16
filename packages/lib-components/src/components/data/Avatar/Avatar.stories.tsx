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
} as Meta<AvatarProps>;

export const Default: StoryFn<AvatarProps> = (args) => <Avatar alt="Harry Potter" {...args} src={placeholder01} />;

export const Sizes: StoryFn = () => (
  <>
    <Avatar alt="Harry Potter" size="tiny" src={placeholder01} />
    <Avatar alt="Harry Potter" size="small" src={placeholder01} />
    <Avatar alt="Harry Potter" size="medium" src={placeholder01} />
    <Avatar alt="Harry Potter" size="large" src={placeholder01} />
    <Avatar alt="Harry Potter" size="huge" src={placeholder01} />
  </>
);

export const Initials: StoryFn = () => (
  <>
    <Avatar alt="Harry Potter" size="tiny">
      {getInitials('Harry Potter')}
    </Avatar>
    <Avatar alt="Harry Potter" size="small">
      {getInitials('Albus Severus Potter')}
    </Avatar>
    <Avatar alt="Harry Potter Vanmiet" size="medium">
      {getInitials('James Sirius Potter ')}
    </Avatar>
    <Avatar alt="Harry Potter" size="large">
      {getInitials('Lily Luna Potter')}
    </Avatar>
    <Avatar alt="Harry Potter" size="huge">
      {getInitials('Lily Luna Potter')}
    </Avatar>
  </>
);
