import { Color, styled } from '../../../styled';

export const Default = styled.button<{ color: Color }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 150ms ease,
    fill 150ms ease,
    stroke 150ms ease;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 0.01rem solid transparent;
  background-clip: padding-box;
  cursor: pointer;
  background-color: transparent;
  padding: ${({ theme }) => theme.spacing['0_25']};
  line-height: 1.6rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAccent};
    div {
      background-color: ${({ theme }) => theme.colors.backgroundAccent};
    }
  }

  &:focus {
    border: 0.01rem solid ${({ theme, color }) => theme.colors[color]};
    div {
      border-color: ${({ theme, color }) => theme.colors[color]};
    }
  }

  &:disabled {
    cursor: not-allowed;
    pointer-events: all;

    svg {
      cursor: not-allowed;

      /* TODO: this should be the disabled color, but this is not set correctly right now */
      fill: ${({ theme }) => theme.colors.placeholder};
    }
  }

  svg {
    cursor: pointer;
    fill: ${({ theme }) => theme.colors.text};
    stroke: ${({ theme }) => theme.colors.text};
  }
`;
