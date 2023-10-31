import { forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { useTabsContext } from './Context';
import { motion } from 'framer-motion';

const Container = styled(motion.button)<{ isActive: boolean }>`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => `${theme.spacing['1']} 0`};
  border-radius: 0;
  border-bottom: 1px solid ${({ theme, isActive }) => (isActive ? theme.colors.background : theme.colors.backgroundAlt)};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.text : theme.colors.textAlt)};

  ${({ theme, isActive }) => {
    if (!isActive) return;

    return `
        border-left: 1px solid ${theme.colors.backgroundAlt};
        border-right: 1px solid ${theme.colors.backgroundAlt};
      `;
  }}
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
