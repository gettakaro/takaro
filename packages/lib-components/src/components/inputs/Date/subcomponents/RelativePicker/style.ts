import { styled } from '../../../../../styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  h4,
  h5 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const InputsContainer = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 0.5fr 1fr;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  div {
    margin-bottom: 0;
  }
`;

export const TenseGrid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);
`;

export const QuickSelectGrid = styled.ul`
  display: grid;

  grid-auto-flow: column;
  grid-template-rows: repeat(5, 1fr);
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => `0 ${theme.spacing[1]}`};

  li {
    text-align: left;
    cursor: pointer;
  }
`;
