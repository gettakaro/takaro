import { FC, PropsWithChildren, ReactElement, useState } from 'react';
import { styled } from '../../../styled';
import { IoMdArrowDropup as ArrowUp } from 'react-icons/io';
import { motion } from 'framer-motion';
import { useTheme } from '../../../hooks';

const StyledList = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    flex-shrink: 0;
  }

  & > div:last-child {
    min-height: 0;
    flex-grow: 1;
  }
`;

export const CollapseList: FC<PropsWithChildren> & {
  Item: FC<PropsWithChildren<ItemProps>>;
} = ({ children }) => {
  return <StyledList role="tree">{children}</StyledList>;
};

interface ItemProps {
  collapsed?: boolean;
  title: string | ReactElement;
  description?: string;
}

const Header = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  min-height: 4rem;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  margin-bottom: ${({ theme, isCollapsed }) => (isCollapsed ? theme.spacing['0_75'] : 0)};

  h3 {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    svg {
      transform: none;
    }
  }

  svg {
    transform: ${({ isCollapsed }) => (isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)')};
    transition: transform 0.1s ease-in-out;
  }
`;

const Item: FC<PropsWithChildren<ItemProps>> = ({ collapsed = false, title, children, description }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%',
      }}
      role="treeitem"
    >
      <Header isCollapsed={isCollapsed} onClick={() => setIsCollapsed((prev) => !prev)}>
        <h3>{title}</h3>
        <ArrowUp size={18} />
      </Header>
      {description && <p>{description}</p>}
      <motion.div
        style={{ maxHeight: '100%', overflowY: 'hidden' }}
        key={`collapse-item-${title}`}
        variants={{
          open: { opacity: 1, height: 'auto', flexGrow: 1, minHeight: 0, overflowY: 'auto', visibility: 'visible' },
          collapsed: { opacity: 0, height: 0, visibility: 'hidden' },
        }}
        initial="collapsed"
        animate={isCollapsed ? 'collapsed' : 'open'}
        transition={{ duration: 0.125, ease: 'linear' }}
      >
        <motion.div
          variants={{
            open: { y: 0 },
            collapsed: { y: -6 },
          }}
          transition={{ duration: 0.125, ease: 'linear' }}
          style={{
            transformOrigin: 'top center',
            padding: `${theme.spacing['0_75']} ${theme.spacing['0_5']} ${theme.spacing['1_5']} ${theme.spacing['1']}`,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

CollapseList.Item = Item;
