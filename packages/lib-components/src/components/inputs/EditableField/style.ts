import { styled } from '../../../styled';

export const Container = styled.div`
  position: relative;
  width: 100%;
  input {
    width: 100%;
    border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
    padding: ${({ theme }) => `${theme.spacing['0_1']} ${theme.spacing['0_5']}`};
  }
`;
