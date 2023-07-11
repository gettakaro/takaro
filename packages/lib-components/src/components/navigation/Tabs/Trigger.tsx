import { forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { useTabsContext } from './Context';

const Container = styled.button<{ isActive: boolean }>`
  border-bottom: 1px solid ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.background)};
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
