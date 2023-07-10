import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button } from '../../../components';
import { Dropdown } from '.';
import { DropdownMenu } from './DropdownMenu';
import { AiOutlineProfile as ProfileIcon } from 'react-icons/ai';

export default {
  title: 'Actions/Dropdown',
  component: Dropdown,
} as Meta;

export const Default: StoryFn = () => {
  return (
    <Dropdown>
      <Dropdown.Trigger asChild>
        <Button text="click me" />
      </Dropdown.Trigger>
      <Dropdown.Menu>
        <DropdownMenu.Group label="Group 1">
          <Dropdown.Menu.Item label="item 1" onClick={() => {}} icon={<ProfileIcon />} />
          <Dropdown.Menu.Item label="item 2" onClick={() => {}} />
          <Dropdown.Menu.Item label="item 3" onClick={() => {}} />
          <Dropdown.Menu.Item label="item 4" onClick={() => {}} />
        </DropdownMenu.Group>
      </Dropdown.Menu>
    </Dropdown>
  );
};
