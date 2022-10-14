import { styled } from '../../../styled';
import { FC, useState } from 'react';
import { AiFillPlusCircle, AiFillMinusCircle } from 'react-icons/ai';

export interface INode {
  name: string;
  startCollapsed?: boolean;
  children?: INodeChild[];
}

export interface INodeChild {
  name: string;
  onClick?: () => void;
}

export interface IExplorerProps {
  nodes: INode[];
}

const StyledNode = styled.div`
  align-items: left;
  justify-content: left;
`;

const StyledNodeList = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
`;

const StyledNodeName = styled.div`
  width: 100%;
  display: flex;
`;

const Node: FC<INode> = ({ name, startCollapsed = false, children = [] }) => {
  const [collapsed, setCollapsed] = useState(startCollapsed);

  if (!collapsed) {
    return (
      <StyledNode>
        <StyledNodeName>
          <AiFillMinusCircle
            onClick={() => setCollapsed(true)}
            style={{ cursor: 'pointer', marginRight: '1rem' }}
          />

          <p>{name}</p>
        </StyledNodeName>

        <StyledNodeList>
          <ul>
          {children.map((c) => (
            <li>{c.name}</li>
          ))}
          </ul>
        </StyledNodeList>
      </StyledNode>
    );
  }

  return (
    <StyledNode>
      
      <AiFillPlusCircle
        onClick={() => setCollapsed(false)}
        style={{ cursor: 'pointer', marginRight: '1rem' }}
      />

      <span>{name}</span>
    </StyledNode>
  );
};

export const Explorer: FC<IExplorerProps> = ({ nodes }) => {
  return (
    <>
      {nodes.map((node) => (
        <Node {...node} />
      ))}
    </>
  );
};
