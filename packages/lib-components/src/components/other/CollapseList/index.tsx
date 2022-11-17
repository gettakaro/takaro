import { FC, PropsWithChildren, useState } from 'react';
import { styled } from '../../../styled';
import { IoMdArrowDropright as ArrowRightIcon } from 'react-icons/io';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../hooks';

// this needs a waaaay better name
export const CollapseList: FC<PropsWithChildren> & {
  Item: FC<PropsWithChildren<ItemProps>>;
} = ({ children }) => {
  return <div>{children}</div>;
};

interface ItemProps {
  actions?: string[];
  collapsed?: boolean;
  title: string;
}

const Header = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  border-bottom: 0.1rem solid ${({ theme }) => theme.colors.background};
  svg {
    transform: ${({ isCollapsed }) =>
      isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)'};
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
        <ArrowRightIcon size={18} />
        <span>{title}</span>
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
              transition={{ duration: 0.125 }}
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
