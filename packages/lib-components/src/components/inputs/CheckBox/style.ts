import { styled } from '../../../styled';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
`;

export const LoadingCheckBox = styled.div`
  &.placeholder {
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    width: 2rem;
    height: 2rem;
    cursor: default;
  }
`;

export const Input = styled.input<{ hasError: boolean; hasDescription: boolean }>`
  width: 2rem;
  height: 2rem;
  border: 0.1rem solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAccent)};
  cursor: pointer;
  position: relative;
  padding: ${({ theme }) => theme.spacing['0_75']};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  transition: 0.15ms linear background;
  vertical-align: middle;

  :disabled {
    background: ${({ theme }) => theme.colors.disabled};
  }

  :checked {
    background: ${({ theme }) => theme.colors.primary};

    :disabled {
      background: ${({ theme }) => theme.colors.disabled};
    }

    ::after {
      position: absolute;
      content: '';
      display: block;
      left: 6px;
      width: 4px;
      top: 3px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
`;
