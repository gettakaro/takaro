import { forwardRef, useEffect, useRef } from 'react';
import { styled } from '../../../styled';

const Container = styled.button`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  text-align: left;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSize.small};
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1_5']}`};

  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  &:last-child {
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  display: grid;
  grid-template-columns: auto 50px auto;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background};
    }
  }
`;

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  disabled?: boolean;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { label, shortcut, disabled, ...props },
  ref,
) {
  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const labelSpan = containerRef.current.children[0] as HTMLSpanElement;
      const shortcutSpan = containerRef.current.children[1] as HTMLSpanElement;
      const totalWidth = labelSpan.offsetWidth + shortcutSpan.offsetWidth + 60;
      containerRef.current.style.minWidth = `${totalWidth}px`;
    }
  }, [label, shortcut]);

  return (
    <Container {...props} ref={ref} role="menuitem" disabled={disabled}>
      <span>{label}</span>
      <span></span>
      <span style={{ textAlign: 'right' }}>{shortcut}</span>
    </Container>
  );
});
