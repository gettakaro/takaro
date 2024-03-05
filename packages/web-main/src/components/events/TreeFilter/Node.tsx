import { UnControlledCheckBox } from '@takaro/lib-components';
import { FC, useEffect, useRef, useState } from 'react';
import { ListItem, ListItemHeader, ListItemName } from './style';

type TreeNodeProps = {
  name: string;
  addFilters: (filters: string[]) => void;
  removeFilters: (filters: string[]) => void;
  isBranchEnabled?: boolean;
  defaultEnabled?: boolean;
};

export const Node: FC<TreeNodeProps> = ({
  name,
  addFilters,
  removeFilters,
  isBranchEnabled,
  defaultEnabled = false,
}) => {
  const [isEnabled, setEnabled] = useState<boolean>(defaultEnabled);
  const isMounted = useRef(false);

  const handleCheckbox = () => {
    isEnabled ? removeFilters([name]) : addFilters([name]);
    setEnabled(!isEnabled);
  };

  useEffect(() => {
    if (isMounted.current) {
      // this does not run on the first render
      setEnabled(isBranchEnabled ?? false);
    } else {
      isMounted.current = true;
    }
  }, [isBranchEnabled]);

  return (
    <ListItem>
      <ListItemHeader>
        <ListItemName>
          <label>{name}</label>
        </ListItemName>
        <UnControlledCheckBox
          size="tiny"
          onChange={handleCheckbox}
          name={'filter'}
          value={isEnabled}
          id={name}
          hasError={false}
          hasDescription={false}
        />
      </ListItemHeader>
    </ListItem>
  );
};
