import { forwardRef } from 'react';
import { styled } from '../../../styled';

const Container = styled.button`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 0;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.elevation[2]};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  &:first-child {
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  &:last-child {
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  disabled?: boolean;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(({ label, disabled, ...props }, ref) => {
  return (
    <Container {...props} ref={ref} role="menuitem" disabled={disabled}>
      {label}
    </Container>
  );
});
