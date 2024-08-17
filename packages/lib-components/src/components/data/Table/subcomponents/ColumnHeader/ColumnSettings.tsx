import { Header, Table } from '@tanstack/react-table';
import { useMemo } from 'react';
import {
  AiOutlineSortAscending as SortAscendingIcon,
  AiOutlineSortDescending as SortDescendingIcon,
  AiOutlineEyeInvisible as HideFieldIcon,
  AiOutlinePushpin as PinIcon,
  AiOutlineDelete as DeleteIcon,
} from 'react-icons/ai';
import { HiOutlineDotsHorizontal as MenuIcon } from 'react-icons/hi';
import { Dropdown, IconButton, Tooltip } from '../../../../../components';
import { MenuTrigger } from './style';

interface ColumnSettingsProps<DataType extends object> {
  header: Header<DataType, unknown>;
  table: Table<DataType>;
  columnIsHovered: boolean;
}

export function ColumnSettings<DataType extends object>({
  header,
  table,
  columnIsHovered,
}: ColumnSettingsProps<DataType>) {
  const toggleSorting = (desc: boolean) => {
    table.setSorting(() => [{ id: header.column.id, desc }]);
  };
  const removeSorting = () => {
    table.setSorting((prev) => [...prev.filter((sort) => sort.id !== header.column.id)]);
  };

  const sortingToggle = useMemo(() => {
    const sort = table.getState().sorting.find((sort) => sort.id === header.column.id);

    if (sort) {
      if (sort.desc) {
        return (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <IconButton
                icon={<SortDescendingIcon />}
                ariaLabel="toggle to ascending"
                onClick={() => toggleSorting(false)}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Toggle to ascending</Tooltip.Content>
          </Tooltip>
        );
      }
      return (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              icon={<SortAscendingIcon />}
              ariaLabel="toggle to descending"
              onClick={() => toggleSorting(true)}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>Toggle to descending</Tooltip.Content>
        </Tooltip>
      );
    }
  }, [table.getState().sorting, header.column.id]);

  return (
    <div>
      {sortingToggle}
      {header.column.getIsPinned() === 'left' && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton icon={<PinIcon />} ariaLabel="Unpin column" onClick={() => header.column.pin(false)} />
          </Tooltip.Trigger>
          <Tooltip.Content>Unpin column</Tooltip.Content>
        </Tooltip>
      )}
      {header.column.getIsPinned() === 'right' && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              icon={<PinIcon style={{ transform: 'scaleX(-1)' }} />}
              ariaLabel="Unpin column"
              onClick={() => header.column.pin(false)}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>Unpin column</Tooltip.Content>
        </Tooltip>
      )}
      <Dropdown>
        <Dropdown.Trigger asChild>
          <MenuTrigger isVisible={columnIsHovered}>
            <IconButton icon={<MenuIcon />} ariaLabel="column settings" />
          </MenuTrigger>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group divider>
            <Dropdown.Menu.Item
              icon={<SortAscendingIcon />}
              onClick={() => {
                if (table.getState().sorting.some((sort) => sort.id === header.column.id && !sort.desc)) {
                  removeSorting();
                } else {
                  toggleSorting(false);
                  /* TODO: WHENEVER sorting multiple columns at once is supported, should first, try to find the id, update if found, add if not found*/
                  //table.setSorting((prev) => [...prev, { id: column.id, desc: false }]);
                }
              }}
              active={table.getState().sorting.some((sort) => sort.id === header.column.id && !sort.desc)}
              label="Sort ascending (A..Z)"
              disabled={!header.column.getCanSort()}
            />
            <Dropdown.Menu.Item
              icon={<SortDescendingIcon />}
              onClick={() => {
                if (table.getState().sorting.some((sort) => sort.id === header.column.id && sort.desc)) {
                  removeSorting();
                } else {
                  toggleSorting(true);
                }
              }}
              disabled={!header.column.getCanSort()}
              active={table.getState().sorting.some((sort) => sort.id === header.column.id && sort.desc)}
              label="Sort descending (Z..A)"
            />
          </Dropdown.Menu.Group>
          <Dropdown.Menu.Item
            active={header.column.getIsPinned() === 'left'}
            disabled={!header.column.getCanPin()}
            icon={<PinIcon />}
            label="Pin to left"
            onClick={() => {
              if (!header.column.getIsPinned() && header.column.getCanPin()) {
                header.column.pin('left');
              } else {
                header.column.pin(false);
              }
            }}
          />
          <Dropdown.Menu.Item
            active={header.column.getIsPinned() === 'right'}
            disabled={!header.column.getCanPin()}
            icon={<PinIcon style={{ transform: 'scaleX(-1)' }} />}
            label="Pin to right"
            onClick={() => {
              if (!header.column.getIsPinned() && header.column.getCanPin()) {
                header.column.pin('right');
              } else {
                header.column.pin(false);
              }
            }}
          />
          <Dropdown.Menu.Item disabled={true} icon={<DeleteIcon />} label="Delete column" onClick={() => {}} />
          <Dropdown.Menu.Item
            icon={<HideFieldIcon />}
            disabled={!header.column.getCanHide()}
            onClick={() => {
              header.column.toggleVisibility(false);
            }}
            label="Hide column"
          />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
