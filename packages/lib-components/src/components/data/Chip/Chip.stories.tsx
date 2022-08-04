import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { Avatar, Chip, ChipProps } from '../../data';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
  text-align: left;

  & > div {
    margin: 1rem;
  }
`;

export default {
  title: 'Data/Chip',
  component: Chip,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;

const Template: Story<ChipProps> = (args) => <Chip {...args} />;
export const Default = Template.bind({});
Default.args = {
  label: 'basic',
  color: 'gray',
  variant: 'default',
  onDelete: undefined,
  onClick: undefined
};

export const Examples = () => (
  <>
    <Chip label="Default Chip" />
    <Chip color="primary" label="Primary default Chip" />
    <Chip color="secondary" label="Secondary default Chip" />
    <Chip color="tertiary" label="Secondary default Chip" />
    <Chip color="quaternary" label="Secondary default Chip" />

    <Chip label="Outlined Chip" variant="outline" />
    <Chip color="primary" label="Primary outlined Chip" variant="outline" />
    <Chip color="secondary" label="Secondary outlined Chip" variant="outline" />

    <Chip
      label="Clickable Chip"
      onClick={() => {
        /* */
      }}
    />
    <Chip
      label="Deletable Chip"
      onDelete={() => {
        /* */
      }}
    />
    <Chip
      avatar={
        <Avatar alt="avatar" size="tiny">
          NC
        </Avatar>
      }
      label="Avatar Chip"
    />

    <Chip dot label="Chip with dot" />
    <Chip color="primary" dot label="Chip with dot" />
    <Chip color="secondary" dot label="Chip with dot" variant="outline" />
  </>
);
