import { styled } from '../../../styled';

export const Container = styled.ul`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  width: fit-content;
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: 1rem;
  background-color: ${({ theme }) => theme.colors.white};

  h3 {
    width: 100%;
    text-align: center;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
  }
`;

export const Action = styled.li`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 200px;
  cursor: pointer;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }): string => theme.colors.secondary};
  transition: transform 0.2s ease-in-out;

  svg {
    margin-right: 1rem;
    fill: ${({ theme }): string => theme.colors.primary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    transform: translateX(0.5rem);
  }
`;
