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
  return <StyledList>{children}</StyledList>;
};

interface ItemProps {
  collapsed?: boolean;
  title: string;
}

const Header = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  min-height: 40px;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  svg {
    transform: ${({ isCollapsed }) =>
      isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
    transition: transform 0.1s ease-in-out;
  }
`;

const Item: FC<PropsWithChildren<ItemProps>> = ({
  collapsed = false,
  title,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const theme = useTheme();

  return (
    <div style={{ width: '100%' }}>
      <Header
        isCollapsed={isCollapsed}
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <span>{title}</span>
        <ArrowUp size={18} />
      </Header>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            variants={{
              open: { opacity: 1, height: '100%' },
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
                padding: `${theme.spacing[1]} ${theme.spacing[1]}`,
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
