import { styled } from '../../../styled';

export const Container = styled.div`
  width: 100%;
  margin-bottom: 2.5rem;
  position: relative;
`;

export const LabelContainer = styled.div`
  width: 100%;
  margin-bottom: 0.5rem;
`;

export const Label = styled.label<{ showError: boolean }>`
  color: ${({ theme, showError }): string => (showError ? theme.colors.error : theme.colors.text)};
  width: 100%;
  user-select: none;
  font-size: 1.4rem;
  font-weight: 500;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 1rem;
    color: ${({ theme, showError }): string =>
      showError ? theme.colors.error : theme.colors.text};
  }
`;
export const InputContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;

  &.placeholder {
    height: 44px;
  }
  .icon {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto 0;
    left: 20px;
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
    margin: auto 0;
    right: 20px;
    cursor: pointer;
    fill: ${({ theme }) => theme.colors.gray};
  }
`;

export const PrefixContainer = styled.div`
  background-color: ${({ theme }): string => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
`;

export const SuffixContainer = styled.div`
  background-color: ${({ theme }): string => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
`;

export const Input = styled.input<{
  hasIcon: boolean;
  hasError: boolean;
  hasPrefix: boolean;
  hasSuffix: boolean;
}>`
  width: 100%;
  padding-left: ${({ hasIcon }): string => (hasIcon ? '60px' : '15px') /* 15 is the standard */};
  background-color: transparent;
  font-size: 1.5rem;
  border: 2px solid
    ${({ theme, hasError }): string => (hasError ? theme.colors.error : theme.colors.background)};
  font-weight: 600;
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  ${({ hasPrefix }) => hasPrefix && 'border-top-left-radius: 0; border-bottom-left-radius: 0;'}
  ${({ hasSuffix }) => hasSuffix && 'border-top-right-radius: 0; border-bottom-right-radius: 0;'}

  &:focus {
    border: 2px solid
      ${({ theme, hasError }): string => (hasError ? theme.colors.error : theme.colors.primary)};
  }
  ::placeholder {
    text-transform: capitalize;
    font-weight: 600;
    color: ${({ theme }): string => theme.colors.gray};
  }
  &[readOnly]::placeholder {
    border-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }): string => theme.colors.primary};
  }
`;

export const ErrorContainer = styled.div<{ showError: boolean }>`
  position: absolute;
  min-height: 4rem;
  display: flex;
  align-items: center;
  bottom: -4.5rem;
  height: auto;
  width: ${({ showError }): string => (showError ? '100%' : '0')};
  background-color: ${({ theme }): string => theme.colors.error};
  transition: width 0.2s ease-in-out, transform 0.3s ease-in-out;
  overflow: hidden;
  border-radius: 0.5rem;
  transform: ${({ showError }): string => `translate(${showError ? '0' : '.5rem'})`};
  z-index: 5;
`;

export const Error = styled.span`
  display: flex;
  align-items: center;
  min-width: 100%;
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  height: 4rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
`;
