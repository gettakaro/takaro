import { Color, styled } from '../../../styled';

export const Default = styled.button<{ color: Color }>`
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
    background-color: ${({ theme }) => theme.colors.secondary};
    svg {
      fill: white;
      stroke: white;
    }
  }

  &:focus {
    border: 0.01rem solid ${({ theme, color }) => theme.colors[color]};
  }

  svg {
    cursor: pointer;
    fill: ${({ theme }) => theme.colors.text};
    stroke: ${({ theme }) => theme.colors.text};
  }
`;
