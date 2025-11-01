import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
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

export const Default: StoryFn<DropdownButtonProps> = () => {
  const [message, setMessage] = useState<string>();

  return (
    <>
      <DropdownButton>
        <Action
          text="Save changes"
          onClick={() => {
            setMessage('save changes event fired');
          }}
        >
          Save changes
        </Action>
        <Action
          text="Save and Schedule"
          onClick={() => {
            setMessage('Save and schedule event fired');
          }}
        >
          Save and schedule
        </Action>
        <Action
          text="Save and publish documen"
          onClick={() => {
            setMessage('save and published fired');
          }}
        >
          Save and publish
        </Action>
        <Action
          text="Export PDF"
          onClick={() => {
            setMessage('Export PDF event fired');
          }}
        >
          Export PDF
        </Action>
      </DropdownButton>
      <p>{message}</p>
    </>
  );
};

export const Description: StoryFn<DropdownButtonProps> = () => {
  const [message, setMessage] = useState<string>();

  return (
    <>
      <DropdownButton>
        <Action text="Merge pull request" onClick={() => setMessage('Merge pull request is fired')}>
          <h4>merge pull request</h4>
          <p>All commits from this branch will be added to the base branchh via a merge commit.</p>
        </Action>
        <Action text="Squash and merge" onClick={() => setMessage('Squash and merge is fired')}>
          <h4>Squash and merge</h4>
          <p>The 4 commits from this branch will be combined into one commit in the base branch.</p>
        </Action>
        <Action text="Rebase and merge" onClick={() => setMessage('Rebase and merge is fired.')}>
          <h4>Rebase and merge</h4>
          <p>the 4 commits from this branch will be rebased and added to the base branch.</p>
        </Action>
      </DropdownButton>
      <p>{message}</p>
    </>
  );
};
