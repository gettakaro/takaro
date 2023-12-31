import { Color, styled } from '../../../styled';

export const Default = styled.button<{ color: Color }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 150ms ease, fill 150ms ease, stroke 150ms ease;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 0.01rem solid transparent;
  background-clip: padding-box;
  cursor: pointer;
  background-color: transparent;
  padding: ${({ theme }) => theme.spacing['0_5']};
  line-height: 1.6rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAccent};
    div {
      background-color: ${({ theme }) => theme.colors.backgroundAccent};
    }
    svg {
      fill: white;
      stroke: white;
    }
  }

  &:focus {
    border: 0.01rem solid ${({ theme, color }) => theme.colors[color]};
    div {
      border-color: ${({ theme, color }) => theme.colors[color]};
    }
    svg {
      fill: white;
      stroke: white;
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

  div {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSize.tiny};
    font-weight: 600;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    width: fit-content;
    height: 1.5rem;
    line-height: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: -${({ theme }) => theme.spacing['0_75']};
    right: -${({ theme }) => theme.spacing['0_75']};
    padding: ${({ theme }) => theme.spacing['0_25']};
    border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  }

  svg {
    cursor: pointer;
    fill: ${({ theme }) => theme.colors.text};
    stroke: ${({ theme }) => theme.colors.text};
  }
`;
