import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Avatar, AvatarGroup, AvatarGroupProps } from '..';

const placeholder01 = 'images/placeholder-01.jpeg';
const placeholder02 = 'images/placeholder-02.jpeg';
const placeholder03 = 'images/placeholder-03.jpeg';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

export default {
  title: 'Data/AvatarGroup',
  component: AvatarGroup,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  subcomponents: { Avatar },
  args: {
    max: 3,
  }
} as Meta<AvatarGroupProps>;

export const Default: StoryFn<AvatarGroupProps> = (args) => (
  <AvatarGroup {...args}>
    <Avatar alt="Harry Potter" size="medium" src={placeholder01} />
    <Avatar alt="Ron Weasley" size="medium" src={placeholder02} />
    <Avatar alt="Hermione Granger" size="medium" src={placeholder03} />
    { /* TODO: add different images for this user */}
    <Avatar alt="Tom Riddle" size="medium" src={placeholder03} />
    <Avatar alt="Tom Riddle" size="medium" src={placeholder03} />
  </AvatarGroup>
);

