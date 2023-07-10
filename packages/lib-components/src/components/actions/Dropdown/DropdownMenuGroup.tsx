import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div<{ divider: boolean }>`
  opacity: 0.5;

  padding-bottom: ${({ theme }) => theme.spacing['0_5']};
  border-bottom: ${({ divider, theme }) => divider && `2px solid ${theme.colors.secondary}`};
  margin-bottom: ${({ divider, theme }) => divider && theme.spacing['0_5']};

  span {
    padding-left: ${({ theme }) => theme.spacing[1]};
  }
`;

interface DropdownGroupProps {
  label?: string;
}

export const DropdownMenuGroup: FC<PropsWithChildren<DropdownGroupProps>> = ({ label, children }) => {
  return (
    <Container role="group" divider={label ? true : false}>
      {label && <span role="presentation">{label}</span>}
      {children}
    </Container>
  );
};
