import { styled } from '../../styled';
import { AlertVariants } from '../../styled/types';

export const Container = styled.div`
  min-width: 300px;
  button {
    margin-top: ${({ theme }) => theme.spacing[1]};
    width: 100%;
  }
  h2 {
    font-size: 2rem;
    color: ${({ theme }): string => theme.colors.secondary};
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
  p {
    text-align: center !important;
    font-size: 1.225rem;
    max-width: 400px;
  }
`;

export const DescriptionContainer = styled.div`
  width: 50%;
  margin: ${({ theme }) => `${theme.spacing[0]} auto `};
`;

export const IconContainer = styled.div<{ type: AlertVariants }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, type }): string => theme.colors[type]};
  padding: ${({ theme }) => theme.spacing['0_75']};
  border-radius: 50%;
  width: fit-content;

  margin-top: ${({ theme }) =>
    `${theme.spacing[0]} auto ${theme.spacing[2]} auto`};

  svg {
    fill: white;
    stroke: white;
  }
`;
