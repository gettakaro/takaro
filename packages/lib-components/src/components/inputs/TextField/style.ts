import { styled } from '../../../styled';

export const Container = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  position: relative;

  p {
    margin-top: ${({ theme }) => theme.spacing['1']};
    color: ${({ theme }) => theme.colors.textAlt};
    white-space: pre-wrap;
    line-height: 1.5;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;

  &.placeholder {
    height: 3.4rem;
  }

  .icon {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: ${({ theme }) => `auto ${theme.spacing[0]}`};
    left: ${({ theme }) => theme.spacing[2]};
  }

  &:focus {
    .icon path {
      transition: fill 0.2s ease-in-out;
      fill: ${({ theme }): string => theme.colors.primary};
      stroke: ${({ theme }): string => theme.colors.primary};
    }
  }

  .password-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: ${({ theme }) => `auto ${theme.spacing[0]}`};
    right: ${({ theme }) => theme.spacing[2]};
    cursor: pointer;
    fill: ${({ theme }) => theme.colors.text};
  }
`;

export const PrefixContainer = styled.div<{ hasError: boolean }>`
  background-color: ${({ theme, hasError }): string =>
    hasError ? theme.colors.error : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `0 ${theme.spacing[1]}`};
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
`;

export const SuffixContainer = styled.div<{ hasError: boolean }>`
  background-color: ${({ theme, hasError }): string =>
    hasError ? theme.colors.error : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `0 ${theme.spacing[1]}`};
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
`;

export const Input = styled.input<{
  hasIcon: boolean;
  hasError: boolean;
  hasPrefix: boolean;
  hasSuffix: boolean;
  isPassword: boolean;
}>`
  width: 100%;
  padding-left: ${({ hasIcon, theme }): string =>
    hasIcon ? theme.spacing[7] : theme.spacing['1_5']};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding-right: ${({ theme, isPassword }) =>
    isPassword ? theme.spacing[6] : 0};
  border: 1px solid
    ${({ theme, hasError }): string =>
      hasError ? theme.colors.error : theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};

  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  ${({ hasPrefix }) =>
    hasPrefix &&
    'border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: none;'}
  ${({ hasSuffix }) =>
    hasSuffix &&
    'border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: none;'}

  &:focus {
    border: 1px solid
      ${({ theme, hasError }): string =>
        hasError ? theme.colors.error : theme.colors.primary};

    ${({ hasPrefix }) => hasPrefix && 'border-left: none;'}
    ${({ hasSuffix }) => hasSuffix && 'border-right: none;'}
  }
  ::placeholder {
    text-transform: capitalize;
    color: ${({ theme }): string => theme.colors.textAlt};
  }
  &[readOnly]::placeholder {
    border-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }): string => theme.colors.primary};
  }
`;
