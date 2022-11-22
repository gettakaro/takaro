import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { Action } from '../../../components';
import { DropdownButton, DropdownButtonProps } from '.';

const WrapperDecorator = styled.div`
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
  h4 {
    font-weight: 600;
  }
`;

export default {
  title: 'Actions/DropdownButton',
  component: DropdownButton,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>],
} as Meta;

export const Default: Story<DropdownButtonProps> = () => {
  return (
    <DropdownButton>
      <Action
        onClick={() => console.log('save changes event fired')}
        text="Save changes"
      >
        Save changes
      </Action>
      <Action
        onClick={() => console.log('save and scheduled event fired')}
        text="Save and schedule"
      >
        Save and schedule
      </Action>
      <Action
        onClick={() => console.log('save and published event fired')}
        text="Save and publish"
      >
        Save and publish
      </Action>
      <Action
        onClick={() => console.log('Export PDF event fired')}
        text="Export PDF"
      >
        Export PDF
      </Action>
    </DropdownButton>
  );
};

export const Description: Story<DropdownButtonProps> = () => {
  return (
    <DropdownButton>
      <Action
        onClick={() => console.log('first is fired')}
        text="Merge pull request"
      >
        <h4>merge pull request</h4>
        <p>
          All commits from this branch will be added to the base branchh via a
          merge commit.
        </p>
      </Action>
      <Action
        onClick={() => console.log('second is fired')}
        text="Squash and merge"
      >
        <h4>Squash and merge</h4>
        <p>
          The 4 commits from this branch will be combined into one commit in the
          base branch.
        </p>
      </Action>
      <Action
        onClick={() => console.log('third option is fired.')}
        text="Rebase and merge"
      >
        <h4>Rebase and merge</h4>
        <p>
          the 4 commits from this branch will be rebased and added to the base
          branch.
        </p>
      </Action>
    </DropdownButton>
  );
};
