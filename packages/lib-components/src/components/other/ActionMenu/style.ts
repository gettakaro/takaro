import { Elevation, styled } from '../../../styled';

export const Container = styled.ul<{ elevation: Elevation }>`
  display: flex;
  flex-direction: column;
  width: fit-content;
  box-shadow: ${({ theme, elevation }) => theme.elevation[elevation]};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Item = styled.li`
  display: grid;
  grid-template-columns: ${({ theme }) => `1fr ${theme.spacing[3]}`};
  align-content: center;
  padding: ${({ theme }) => theme.spacing['0_75']};
  cursor: pointer;

  &:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  &:last-child {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  p {
    color: ${({ theme }): string => theme.colors.secondary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    * {
      color: white;
    }

    svg.checkmark {
      fill: white;
    }
  }

  svg.checkmark {
    margin-left: ${({ theme }) => theme.spacing[1]};
    fill: ${({ theme }): string => theme.colors.text};
  }
`;
