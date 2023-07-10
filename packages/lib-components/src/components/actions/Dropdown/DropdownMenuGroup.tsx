import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div<{ divider: boolean }>`
  padding-bottom: ${({ theme }) => theme.spacing['0_5']};
  border-bottom: ${({ divider, theme }) => divider && `2px solid ${theme.colors.secondary}`};
  margin-bottom: ${({ divider, theme }) => divider && theme.spacing['0_5']};

  span {
    opacity: 0.5;
    padding-left: ${({ theme }) => theme.spacing[1]};
  }
`;

interface DropdownGroupProps {
  label?: string;
  divider?: boolean;
}

export const DropdownMenuGroup: FC<PropsWithChildren<DropdownGroupProps>> = ({ label, divider = false, children }) => {
  const showDivider = divider || label ? true : false;

  return (
    <Container role="group" divider={showDivider}>
      {label && <span role="presentation">{label}</span>}
      {children}
    </Container>
  );
};
