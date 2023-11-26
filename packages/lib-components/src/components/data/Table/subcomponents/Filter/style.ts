import { styled } from '../../../../../styled';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing['1_5']};
`;

export const FilterContainer = styled.div<{ hasMultipleFields: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasMultipleFields }) => (hasMultipleFields ? '20px 1fr 1fr 1fr' : '1fr 1fr 1fr')};
  gap: ${({ theme }) => theme.spacing['1_5']};
  align-items: center;
`;

export const ButtonContainer = styled.div<{ justifyContent: string }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ justifyContent }) => justifyContent};
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

export const FilterActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;
