import { styled } from '../../../../styled';

export const Container = styled.div`
  width: 100%;
  position: relative;
`;

export const ResultContainer = styled.div<{ readOnly: boolean; hasError: boolean }>`
  list-style-type: none;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing['0_75']};
  outline: 0;
  border: 0.1rem solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.elevation[4]};
  text-transform: capitalize;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'pointer')};
  user-select: none;

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ContentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing['0_75']};
`;

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-top: ${({ theme }) => theme.spacing['1']};
`;
