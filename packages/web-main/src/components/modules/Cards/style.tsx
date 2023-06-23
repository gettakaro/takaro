import { styled, DialogBody, Button } from '@takaro/lib-components';

export const ModuleCards = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: 160px;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

export const ModuleCardContainer = styled.a`
  padding: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

export const AddModuleCard = styled(ModuleCardContainer)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAlt};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  h3 {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
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

export const DeleteDialogContainer = styled(DialogBody)`
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export const SpacedButton = styled(Button)`
  margin-right: ${({ theme }) => theme.spacing[1]};
  margin-left: ${({ theme }) => theme.spacing[1]};
`;
