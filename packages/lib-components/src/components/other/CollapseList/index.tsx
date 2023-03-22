import { FC, PropsWithChildren, useState } from 'react';
import { styled } from '../../../styled';
import { IoMdArrowDropup as ArrowUp } from 'react-icons/io';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../hooks';

// this needs a waaaay better name
export const CollapseList: FC<PropsWithChildren> & {
  Item: FC<PropsWithChildren<ItemProps>>;
} = ({ children }) => {
  return <div>{children}</div>;
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
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 0.5rem;
  margin-bottom: ${({ theme }) => theme.spacing[1]};

  svg {
    transform: ${({ isCollapsed }) =>
      isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'};
    transition: transform 0.1s ease-in-out;
  }
  span {
    font-size: 1.4rem;
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
    <div>
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
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            style={{ padding: theme.spacing[1], overflowX: 'hidden' }}
          >
            <motion.div
              variants={{
                open: { y: 0 },
                collapsed: { y: -6 },
              }}
              transition={{ duration: 0.125, ease: 'linear' }}
              style={{
                transformOrigin: 'top center',
                padding: `${theme.spacing[1]} 0`,
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
