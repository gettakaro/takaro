import { styled } from '../../../styled';

export const Container = styled.div`
  position: relative;
  input {
    border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAlt};
  }
`;
