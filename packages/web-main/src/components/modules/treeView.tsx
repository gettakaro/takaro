import { createRef, FC, RefObject, useState } from 'react';
import Tree, { TreeNode, BasicDataNode, TreeProps } from 'rc-tree';

import 'rc-tree/assets/index.css';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from 'react-query';
import { ModuleOutputArrayDTOAPI } from '@takaro/apiclient';
import { Loading } from '@takaro/lib-components';
import { NavLink } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiFillPlusCircle, AiOutlineFolder } from 'react-icons/ai';
import { DataNode } from 'rc-tree/lib/interface';

export const ModulesTreeView: FC = () => {
  const client = useApiClient();

  const { data, isLoading, refetch } = useQuery<ModuleOutputArrayDTOAPI>(
    'modules',
    async () => (await client.module.moduleControllerSearch()).data
  );

  const treeRef: RefObject<Tree> = createRef();
  const [tree, setTree] = useState(null);

  function onSelect(selectedKeys, info) {
    console.log('onSelect', selectedKeys, info);
  }

  function onCheck(checkedKeys, info) {
    console.log('onCheck', checkedKeys, info);
  }

  function onExpand(expandedKeys) {
    console.log('onExpand', expandedKeys);
  }

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  if (!data.data.length) {
    return (
      <div>
        No modules yet, create
        <NavLink to={PATHS.modules.create}>
          <AiFillPlusCircle />
        </NavLink>
      </div>
    );
  }


  const treeData: DataNode[] = [];

  for (const module of data.data) {

    const nodeData: DataNode = {
      key: module.id,
      title: module.name,
      icon: <AiOutlineFolder />,
      checkable: false,
    }

    treeData.push(nodeData)
  }

  return (
    <Tree
      ref={treeRef}
      className="myCls"
      showLine
      checkable
      defaultExpandAll
      defaultExpandedKeys={[]}
      onExpand={onExpand}
      defaultSelectedKeys={[]}
      defaultCheckedKeys={[]}
      onSelect={onSelect}
      onCheck={onCheck}
      onActiveChange={(key) => console.log('Active:', key)}
      treeData={treeData}
    />
  );
};
