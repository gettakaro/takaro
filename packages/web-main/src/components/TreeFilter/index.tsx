import { FC } from 'react';
import { List, Wrapper } from './style';
import { Branch } from './Branch';
import { Node } from './Node';

export type TreeNode = {
  name: string;
  defaultEnabled?: boolean;
  children?: TreeNode[];
};

export type TreeFilterProps = {
  data?: TreeNode[];
  addFilters: (filters: string[]) => void;
  removeFilters: (filters: string[]) => void;
};

export const TreeFilter: FC<TreeFilterProps> = ({ data, addFilters, removeFilters }) => {
  return (
    <Wrapper>
      <List>
        {data?.map((node: TreeNode, index: number) => {
          if (node.children) {
            return (
              <Branch node={node} addFilters={addFilters} removeFilters={removeFilters} key={`treeBranch-${index}`} />
            );
          }
          return (
            <Node name={node.name} addFilters={addFilters} removeFilters={removeFilters} key={`treeNode-${index}`} />
          );
        })}
      </List>
    </Wrapper>
  );
};
