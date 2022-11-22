import { styled } from '../../../styled';

export const Container = styled.div`
  position: relative;
  input {
    border: 1px solid ${({ theme }) => theme.colors.gray};
  }
`;
