import { FC } from 'react';
import { ToggleButtonGroup, useLocalStorage } from '@takaro/lib-components';
import { AiOutlineTable as TableViewIcon, AiOutlineUnorderedList as CardViewIcon } from 'react-icons/ai';

type ViewType = 'card' | 'table';

interface ViewSelectorProps {
  id: string;
  tableView: JSX.Element;
  cardView: JSX.Element;
  defaultView?: ViewType;
}

export const ViewSelector: FC<ViewSelectorProps> = ({ id, tableView, cardView, defaultView = 'card' }) => {
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>(id, defaultView);

  return (
    <>
      <div
        style={{
          width: '100%',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ToggleButtonGroup
          onChange={(val) => setView(val as ViewType)}
          exclusive={true}
          orientation="horizontal"
          defaultValue={view}
        >
          <ToggleButtonGroup.Button value="card" tooltip="Card view">
            <CardViewIcon size={20} />
          </ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value="table" tooltip="Table view">
            <TableViewIcon size={20} />
          </ToggleButtonGroup.Button>
        </ToggleButtonGroup>
      </div>

      {view === 'table' && tableView}
      {view === 'card' && cardView}
    </>
  );
};
