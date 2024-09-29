import { styled, Button } from '@takaro/lib-components';

export const CardList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

export const SpacedButton = styled(Button)`
  margin-right: ${({ theme }) => theme.spacing[1]};
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

export const InnerBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 400px;
  height: 150px;
`;

export const SpacedRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ActionIconsContainer = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  svg:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
