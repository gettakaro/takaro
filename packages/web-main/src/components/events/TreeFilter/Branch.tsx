import { FC, useState } from 'react';
import { List, ListItem, ListItemHeader, ListItemName } from './style';
import { AiOutlineDown as DownArrowIcon } from 'react-icons/ai';
import { UnControlledCheckBox } from '@takaro/lib-components';
import { Node } from './Node';
import { TreeNode } from '.';

type TreeBranchProps = {
  addFilters: (filters: string[]) => void;
  removeFilters: (filters: string[]) => void;
  node: TreeNode;
};

// When disabling a branch all nodes should be disabled
// When enabling a branch all nodes should be enabled
// if all nodes are disabled, the branch should be disabled
// if all nodes are enabled, the branch should be enabled
export const Branch: FC<TreeBranchProps> = ({ node, addFilters, removeFilters }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEnabled, setEnabled] = useState(node.defaultEnabled ?? false);

  const nodeFilters = node.children?.map((child) => child.name) ?? [];

  const handleCheckbox = () => {
    if (isEnabled) {
      removeFilters(nodeFilters);
    } else {
      addFilters(nodeFilters);
    }

    setEnabled(!isEnabled);
  };

  return (
    <ListItem isBranch={true}>
      <ListItemHeader isBranch={true}>
        <ListItemName onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
          <DownArrowIcon style={{ transform: isOpen ? 'none' : 'rotate(-90deg)' }} />
          <p>{node.name}</p>
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
      {node.children && isOpen && (
        <List>
          {node.children.map((node: TreeNode, index: number) => (
            <Node
              name={node.name}
              addFilters={addFilters}
              removeFilters={removeFilters}
              isBranchEnabled={isEnabled}
              defaultEnabled={node.defaultEnabled}
              key={`treeNode-${index}`}
            />
          ))}
        </List>
      )}
    </ListItem>
  );
};
