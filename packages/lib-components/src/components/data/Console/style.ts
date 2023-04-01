import { styled } from '../../../styled';

export const Wrapper = styled.div`
  height: auto;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;
