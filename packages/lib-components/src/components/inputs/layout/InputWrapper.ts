import { styled } from '../../../styled';

export const InputWrapper = styled.div<{ marginBottom?: string }>`
  width: 100%;
  margin-bottom: ${({ theme, marginBottom }) => (marginBottom ? marginBottom : theme.spacing[2])};
`;
