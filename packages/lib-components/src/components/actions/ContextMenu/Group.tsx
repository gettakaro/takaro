import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div<{ divider: boolean; hasChildren: boolean }>`
  border-bottom: ${({ divider, theme, hasChildren }) =>
    divider && hasChildren && `1px solid ${theme.colors.secondary}`};
  padding-left: 0;
  background-color: ${({ theme }) => theme.colors.background};
  & > span {
    opacity: 0.5;
    padding-left: ${({ theme }) => theme.spacing[1]};
    font-weight: 600;
    font-size: ${({ theme }) => theme.fontSize.tiny};
  }
  &:last-child {
    border-bottom: none;
  }
`;

interface DropdownGroupProps {
  label?: string;
  divider?: boolean;
}

export const Group: FC<PropsWithChildren<DropdownGroupProps>> = ({ label, divider = false, children }) => {
  const showDivider = divider || label ? true : false;

  return (
    <Container role="group" divider={showDivider} hasChildren={Array.isArray(children) ? children.length !== 0 : true}>
      {label && <span role="presentation">{label}</span>}
      {children}
    </Container>
  );
};
