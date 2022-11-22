import { styled } from '../../../styled';

export const Container = styled.div`
  input {
    border: 1px solid ${({ theme }) => theme.colors.gray};
  }
`;

export const ErrorMessage = styled.span`
  display: block;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.error};
`;
