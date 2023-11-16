import { styled } from '../../../../../styled';

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[2]};
  min-width: 400px;
  h4 {
    margin-bottom: ${({ theme }) => theme.spacing['1']};
  }
`;

export const CommonlyUsedGrid = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, 1fr);
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
  padding: 0 ${({ theme }) => theme.spacing[1]};

  li {
    text-align: left;
    cursor: pointer;
  }
`;

export const StyledForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const InputsContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 0.5fr 0.5fr 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  div {
    width: 100%;
    margin-bottom: 0;
  }
`;
