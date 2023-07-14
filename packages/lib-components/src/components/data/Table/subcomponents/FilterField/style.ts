import { styled } from '../../../../../styled';

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
    left: ${({ theme }) => theme.spacing['0_75']};
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
    right: ${({ theme }) => theme.spacing['1']};
    cursor: pointer;
    fill: ${({ theme }) => theme.colors.text};
  }
`;

export const Input = styled.input`
  width: 100%;
  padding-left: ${({ theme }): string => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding-right: ${({ theme }) => theme.spacing['1']};
  border: 1px solid ${({ theme }): string => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};

  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &:focus {
    border: 1px solid ${({ theme }): string => theme.colors.primary};
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

export const AutoCompleteContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }): string => theme.colors.secondary};
  border-radius: ${({ theme }): string => theme.borderRadius.medium};
`;

export const ListItem = styled.button<{ isActive: boolean }>`
  width: 100%;
  background-color: ${({ theme, isActive }): string => (isActive ? theme.colors.secondary : theme.colors.background)};
  color: ${({ theme }): string => theme.colors.text};
`;
