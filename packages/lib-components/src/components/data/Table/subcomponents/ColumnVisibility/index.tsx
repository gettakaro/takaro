import { Table } from '@tanstack/react-table';
import { Dropdown, IconButton } from '../../../../../components';
import { AiOutlineEye as EyeIcon } from 'react-icons/ai';
import { Dispatch, SetStateAction } from 'react';

interface ColumnVisibilityProps<DataType extends object> {
  table: Table<DataType>;
  setOpenColumnVisibilityTooltip: Dispatch<SetStateAction<boolean>>;
  openColumnVisibilityTooltip: boolean;
  setHasShownColumnVisibilityTooltip: Dispatch<SetStateAction<boolean>>;
  hasShownColumnVisibilityTooltip: boolean;
}

export function ColumnVisibility<DataType extends object>({
  table,
  setOpenColumnVisibilityTooltip,
  openColumnVisibilityTooltip,
  setHasShownColumnVisibilityTooltip,
}: ColumnVisibilityProps<DataType>) {
  return (
    <Dropdown>
      <Dropdown.Trigger
        asChild
        tooltipOptions={{
          onOpenChange: setOpenColumnVisibilityTooltip,
          open: openColumnVisibilityTooltip,
          content: 'Show or hide columns',
          placement: 'right',
        }}
      >
        <IconButton size="large" icon={<EyeIcon />} ariaLabel="Columns" />
      </Dropdown.Trigger>
      <Dropdown.Menu>
        <Dropdown.Menu.Group label="Visible columns">
          {table
            .getVisibleFlatColumns()
            .filter((column) => column.getCanHide() === true)
            .map((column) => (
              <Dropdown.Menu.Item
                key={column.id}
                onClick={() => {
                  // In case they open the dropdown they already know about the column visibility
                  setHasShownColumnVisibilityTooltip(true);
                  column.toggleVisibility();
                }}
                label={column.id}
                activeStyle="checkbox"
                active={true}
              />
            ))}
        </Dropdown.Menu.Group>
        <Dropdown.Menu.Group label="Hidden columns">
          {table
            .getAllLeafColumns()
            .filter((column) => column.getCanHide() === true)
            .filter((column) => column.getIsVisible() === false)
            .map((column) => (
              <Dropdown.Menu.Item
                key={column.id}
                onClick={() => {
                  // In case they open the dropdown they already know about the column visibility
                  setHasShownColumnVisibilityTooltip(true);
                  column.toggleVisibility();
                }}
                label={column.id}
                activeStyle="checkbox"
                active={false}
              />
            ))}
        </Dropdown.Menu.Group>
      </Dropdown.Menu>
    </Dropdown>
  );
}
