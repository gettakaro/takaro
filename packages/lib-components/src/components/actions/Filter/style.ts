import { styled } from '../../../styled';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing['1_5']};
  min-width: 800px;
`;

export const FilterContainer = styled.div<{ hasMultipleFields: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasMultipleFields }) => (hasMultipleFields ? '20px 1.75fr 1fr 2fr' : '1.75fr 1fr 2fr')};
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

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1_5']};
  div {
    margin-bottom: 0;
    height: 100%;
  }
`;

export const FilterWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['1_5']};
`;
