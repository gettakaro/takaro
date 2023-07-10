import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div`
  opacity: 0.5;
  padding-top: ${({ theme }) => theme.spacing['0_5']};

  span {
    padding-left: ${({ theme }) => theme.spacing[1]};
  }
`;

interface DropdownGroupProps {
  label?: string;
}

export const DropdownMenuGroup: FC<PropsWithChildren<DropdownGroupProps>> = ({ label, children }) => {
  return (
    <Container role="group">
      {label && <span role="presentation">{label}</span>}
      {children}
    </Container>
  );
};
