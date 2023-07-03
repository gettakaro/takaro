import { styled } from '../../../styled';

export const Wrapper = styled.div<{ marginBottom?: string }>`
  margin-bottom: ${({ theme, marginBottom }) => (marginBottom ? marginBottom : theme.spacing[2])};
`;
