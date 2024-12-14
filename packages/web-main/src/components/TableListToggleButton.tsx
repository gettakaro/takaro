import { ToggleButtonGroup } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineTable as TableViewIcon, AiOutlineUnorderedList as ListViewIcon } from 'react-icons/ai';

export type ViewType = 'list' | 'table';
interface TableListToggleButtonProps {
  onChange: (view: ViewType) => void;
  value: ViewType;
}

export const TableListToggleButton: FC<TableListToggleButtonProps> = ({ value, onChange }) => {
  return (
    <ToggleButtonGroup
      onChange={(val) => onChange(val as ViewType)}
      exclusive={true}
      orientation="horizontal"
      defaultValue={value}
    >
      <ToggleButtonGroup.Button value="list" tooltip="List view">
        <ListViewIcon size={20} />
      </ToggleButtonGroup.Button>
      <ToggleButtonGroup.Button value="table" tooltip="Table view">
        <TableViewIcon size={20} />
      </ToggleButtonGroup.Button>
    </ToggleButtonGroup>
  );
};
