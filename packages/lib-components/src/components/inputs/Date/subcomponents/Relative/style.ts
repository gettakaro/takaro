import { styled } from '../../../../../styled';

export const StyledForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const InputsContainer = styled.div`
  display: grid;
  grid-template-columns: 0.4fr 1fr;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  div {
    margin-bottom: 0;
  }
`;
