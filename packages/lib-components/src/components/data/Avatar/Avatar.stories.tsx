// TODO: save images locally so when there is no network they are still loaded.
import { Meta, Story } from '@storybook/react';
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

export default {
  title: 'Data/Avatar',
  component: Avatar,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />;
const placeholder01 = 'images/placeholder-01.jpeg';
export const Basic = Template.bind({});
Basic.args = { alt: 'Harry Potter', size: 'medium', src: placeholder01 };

export const Sizes = () => (
  <>
    <Avatar alt="Harry Potter" size="tiny" src={placeholder01} />
    <Avatar alt="Harry Potter" size="small" src={placeholder01} />
    <Avatar alt="Harry Potter" size="medium" src={placeholder01} />
    <Avatar alt="Harry Potter" size="large" src={placeholder01} />
    <Avatar alt="Harry Potter" size="huge" src={placeholder01} />
  </>
);

export const Initials = () => (
  /* I added a double last name to show that it takes up to 2 letters from their lastname */
  <>
    <Avatar alt="Harry Potter" size="tiny">
      {getInitials('Harry', 'Potter ')}
    </Avatar>
    <Avatar alt="Harry Potter" size="small">
      {getInitials('Albus', 'Severus Potter')}
    </Avatar>
    <Avatar alt="Harry Potter Vanmiet" size="medium">
      {getInitials('James ', 'Sirius Potter ')}
    </Avatar>
    <Avatar alt="Harry Potter" size="large">
      {getInitials('Lily', 'Luna Potter')}
    </Avatar>
    <Avatar alt="Harry Potter" size="huge">
      {getInitials('Lily', 'Luna Potter')}
    </Avatar>
  </>
);
