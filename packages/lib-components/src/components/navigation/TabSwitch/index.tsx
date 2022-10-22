import { FC, useState, ReactElement, ReactNode, useContext } from 'react';
import { ThemeType } from '../../../styled';
import { AnimateSharedLayout, AnimatePresence } from 'framer-motion';
import { ThemeContext } from 'styled-components';
import { Container, List, TabContentContainer, Item, Background } from './style';

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
