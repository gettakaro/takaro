import { forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { useTabsContext } from './Context';
import { motion } from 'framer-motion';

const Container = styled(motion.button)<{ isActive: boolean }>`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => `${theme.spacing['1']} 0`};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.text : theme.colors.textAlt)};

  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  border-left: ${({ theme, isActive }) => (isActive ? `2px solid ${theme.colors.backgroundAlt}` : 'none')};
  border-right: ${({ theme, isActive }) => (isActive ? `2px solid ${theme.colors.backgroundAlt}` : 'none')};
  border-bottom: ${({ theme, isActive }) => (isActive ? 'none' : `2px solid ${theme.colors.backgroundAlt}`)};

  &:first-child {
    border-left: none;
  }

  &:last-child {
    border-right: none;
  }
`;

interface TriggerProps {
  value: string;
  asChild?: boolean;
  disabled?: boolean;
}

export const Trigger = forwardRef<HTMLButtonElement, PropsWithChildren<TriggerProps>>(
  ({ children, disabled, value }, ref) => {
    const { setValue, value: selectedValue } = useTabsContext();

    const handleClick = () => {
      if (disabled) return;
      setValue(value);
    };

    const isActive = value === selectedValue;

    return (
      <Container
        role="tab"
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        isActive={isActive}
        aria-selected={isActive}
        aria-controls={`tab-content-${value}`}
      >
        {children}
      </Container>
    );
  }
);
