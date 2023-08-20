import { UnControlledCheckBox } from '@takaro/lib-components';
import { FC, useEffect, useState } from 'react';
import { ListItem, ListItemHeader, ListItemName } from './style';

type TreeNodeProps = {
  name: string;
  addFilters: (filters: string[]) => void;
  removeFilters: (filters: string[]) => void;
  isBranchEnabled?: boolean;
};

export const Node: FC<TreeNodeProps> = ({ name, addFilters, removeFilters, isBranchEnabled }) => {
  const [isEnabled, setEnabled] = useState(isBranchEnabled ?? false);

  const handleCheckbox = () => {
    if (isEnabled) {
      removeFilters([name]);
    } else {
      addFilters([name]);
    }

    setEnabled(!isEnabled);
  };

  useEffect(() => {
    setEnabled(isBranchEnabled ?? false);
  }, [isBranchEnabled]);

  return (
    <ListItem>
      <ListItemHeader>
        <ListItemName>
          <p>{name}</p>
        </ListItemName>
        <UnControlledCheckBox
          size="tiny"
          onChange={handleCheckbox}
          name={'filter'}
          value={isEnabled}
          id="1"
          hasError={false}
          hasDescription={false}
        />
      </ListItemHeader>
    </ListItem>
  );
};
