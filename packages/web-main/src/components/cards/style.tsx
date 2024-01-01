import { styled, Button } from '@takaro/lib-components';

export const CardList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: ${({ theme }) => theme.spacing['1_5']};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const SpacedButton = styled(Button)`
  margin-right: ${({ theme }) => theme.spacing[1]};
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 150px;
`;

export const SpacedRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ActionIconsContainer = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  svg:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
