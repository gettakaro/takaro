import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { IconButton } from '../../../components';
import { Dropdown } from '.';
import { DropdownMenu } from './DropdownMenu';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineSortAscending as SortAscendingIcon,
  AiOutlineSortDescending as SortDescendingIcon,
  AiOutlineFilter as FilterIcon,
  AiOutlineGroup as GroupIcon,
  AiOutlineEyeInvisible as HideIcon,
  AiOutlineDelete as DeleteIcon,
} from 'react-icons/ai';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export default {
  title: 'Actions/Dropdown',
  component: Dropdown,
} as Meta;

export const Default: StoryFn = () => {
  return (
    <Wrapper>
      <Dropdown>
        <Dropdown.Trigger asChild>
          <IconButton icon={<MenuIcon />} ariaLabel="click me" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <DropdownMenu.Group label="Sorting">
            <Dropdown.Menu.Item label="Sort ascending (first...last)" onClick={() => {}} icon={<SortAscendingIcon />} />
            <Dropdown.Menu.Item
              label="Sort descending (last...first)"
              onClick={() => {}}
              icon={<SortDescendingIcon />}
            />
          </DropdownMenu.Group>

          <DropdownMenu.Group label="Editing">
            <Dropdown.Menu.Item label="Edit values..." onClick={() => {}} icon={<EditIcon />} />
            <Dropdown.Menu.Item label="Filter by values" onClick={() => {}} icon={<FilterIcon />} />
            <Dropdown.Menu.Item label="Group by values" onClick={() => {}} icon={<GroupIcon />} />
          </DropdownMenu.Group>

          <DropdownMenu.Group>
            <Dropdown.Menu.Item label="Hide field" onClick={() => {}} icon={<HideIcon />} disabled />
            <Dropdown.Menu.Item label="Delete field" onClick={() => {}} icon={<DeleteIcon />} />
          </DropdownMenu.Group>
        </Dropdown.Menu>
      </Dropdown>
    </Wrapper>
  );
};

export const ToolTipOnTrigger = () => {
  return (
    <>
      Because <strong>Dropdown.trigger</strong> adds properties to the child element, The IconButton cannot be wrapped
      in a tooltip. Tooltip props should be passed as props to the <strong>Dropdown.trigger</strong> element.
      <Dropdown>
        <Dropdown.Trigger
          asChild
          tooltipOptions={{
            content: 'This is the tooltip',
            placement: 'top',
          }}
        >
          <IconButton icon={<MenuIcon />} ariaLabel="click me" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item label="Sort ascending (first...last)" onClick={() => {}} icon={<SortAscendingIcon />} />
          <Dropdown.Menu.Item label="Sort descending (last...first)" onClick={() => {}} icon={<SortDescendingIcon />} />
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
