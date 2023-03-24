import { Elevation, styled } from '../../../styled';

export const Container = styled.ul<{ elevation: Elevation }>`
  display: flex;
  flex-direction: column;
  width: fit-content;
  box-shadow: ${({ theme, elevation }) => theme.elevation[elevation]};
  border-radius: 0.5rem;
  border: 2px solid ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.background};

  h3 {
    width: 100%;
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing['0_25']};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
`;

export const Item = styled.li`
  display: grid;
  grid-template-columns: ${({ theme }) => theme.spacing[4]} 1fr;
  padding: ${({ theme }) => theme.spacing['1_5']};
  min-width: 20rem;
  max-width: 30rem;
  cursor: pointer;
  min-height: 4.5rem;

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
    background-color: ${({ theme }) => theme.colors.primary};
    * {
      color: white !important;
    }

    svg {
      fill: white;
    }
  }

  svg {
    margin-right: ${({ theme }) => theme.spacing[1]};
    fill: ${({ theme }): string => theme.colors.primary};
  }
`;
