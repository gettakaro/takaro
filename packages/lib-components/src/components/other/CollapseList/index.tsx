import { FC, PropsWithChildren, useState } from 'react';
import { styled } from '../../../styled';
import { IoMdArrowDropup as ArrowUp } from 'react-icons/io';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../hooks';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  & > div:last-child {
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
  title: string;
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
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme, isCollapsed }) => (isCollapsed ? theme.spacing['0_75'] : 0)};

  svg {
    transform: ${({ isCollapsed }) => (isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)')};
    transition: transform 0.1s ease-in-out;
  }
`;

const Item: FC<PropsWithChildren<ItemProps>> = ({ collapsed = false, title, children, description }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const theme = useTheme();

  return (
    <div style={{ width: '100%' }} role="treeitem">
      <Header isCollapsed={isCollapsed} onClick={() => setIsCollapsed((prev) => !prev)}>
        <h3>{title}</h3>
        <ArrowUp size={18} />
      </Header>
      {description && <p>{description}</p>}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            key={`collapse-item-${title}`}
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            initial="collapsed"
            animate="open"
            exit="collapsed"
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
                padding: `${theme.spacing['0_75']} ${theme.spacing['0']} ${theme.spacing['1_5']} ${theme.spacing['0']}`,
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// set dot component
CollapseList.Item = Item;
