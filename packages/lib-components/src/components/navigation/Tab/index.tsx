import { FC, useState, ReactElement, ReactNode, useContext } from 'react';
import { styled } from '../../../styled';
import { ThemeType } from '../../../styled/theme';
import { motion, AnimateSharedLayout, AnimatePresence } from 'framer-motion';
import { ThemeContext } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const List = styled.ul<{ color: string }>`
  display: flex;
  align-items: center;
  width: fit-content;
  justify-content: space-between;
  ${({ theme, color }) => {
    switch (color) {
      case 'primary':
        return `border: 4px solid ${theme.colors.primary};`;
      case 'secondary':
        return `border: 4px solid ${theme.colors.secondary};`;
      case 'white':
        return 'border: 4px solid white;';
      case 'gradient':
        return 'border: 4px solid none;';
    }
  }}
  border-radius: 2rem;
  color: ${({ theme }): string => theme.colors.text};
  margin-bottom: 50px;
`;

const TabContentContainer = styled(motion.div)`
  width: 100%;
`;
export interface TabSwitchProps {
  children: Array<ReactElement<{ label: string; children: ReactNode }>>;
  color?: 'primary' | 'secondary' | 'white';
}

export const TabSwitch: FC<TabSwitchProps> = ({ children, color = 'primary' }) => {
  const [selected, setSelected] = useState<string>(children[0].props.label);

  return (
    <Container>
      <AnimateSharedLayout>
        <List color={color}>
          {children.map((child) => (
            <TabItem
              color={color}
              isSelected={selected === child.props.label}
              key={child.props.label}
              label={child.props.label}
              onClick={() => setSelected(child.props.label)}
            />
          ))}
        </List>
      </AnimateSharedLayout>
      <AnimatePresence exitBeforeEnter>
        <TabContentContainer
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          initial={{ opacity: 0, y: 20 }}
          style={{ backgroundColor: 'orange' }}
          transition={{ duration: 0.15 }}
        >
          {children.filter((child) =>
            child.props.label === selected ? child.props.children : null
          )}
        </TabContentContainer>
      </AnimatePresence>
    </Container>
  );
};

/* TAB COMPONENT */
const Item = styled.li<{ selected: boolean; white: boolean }>`
  cursor: pointer;
  text-align: center;
  flex: 1 1 0;
  padding: 15px;
  font-weight: 800;
  flex-grow: 1;
  flex-basis: 0;
  border-radius: 1.225rem;
  transition: all 0.2s ease-in-out;
  position: relative;
  span {
    position: relative;
    font-size: 1.2rem;
    z-index: 1;
    color: ${({ theme, selected, white }): string =>
      selected ? (white ? theme.colors.gray : 'white') : theme.colors.gray};
  }
`;
const Background = styled(motion.div)`
  position: absolute;
  border-radius: 1.5rem;
  width: 101%;
  top: 0;
  left: 0;
  height: calc(100% + 2px);
  background-color: transparent;
`;
export interface TabProps {
  isSelected: boolean;
  label: string;
  onClick: () => void;
  color: 'primary' | 'secondary' | 'white';
}

const TabItem: FC<TabProps> = ({ isSelected, label, onClick, color }) => {
  const themeContext = useContext<ThemeType>(ThemeContext);

  function getColor() {
    switch (color) {
      case 'white':
        return 'white';
      case 'primary':
      case 'secondary':
        return themeContext.colors[color];
    }
  }

  return (
    <Item onClick={onClick} selected={isSelected} white={color === 'white'}>
      {isSelected && (
        <Background
          animate={{ background: getColor() }}
          initial={false}
          layoutId="background"
          transition={{ type: 'spring', stiffness: 500, damping: 50 }}
        ></Background>
      )}
      <span>{label}</span>
    </Item>
  );
};
