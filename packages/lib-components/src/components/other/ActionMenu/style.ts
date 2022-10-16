import { styled } from '../../../styled';

export const Container = styled.ul`
  display: flex;
  flex-direction: column;
  width: fit-content;
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: 0.5rem;
  border: 2px solid ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.white};

  h3 {
    width: 100%;
    text-align: center;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
  }
`;

export const Item = styled.li`
  display: grid;
  grid-template-columns: 30px 1fr;
  padding: 1rem 1rem;
  min-width: 200px;
  max-width: 300px;
  cursor: pointer;
  min-height: 45px;

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
    margin-right: 1rem;
    fill: ${({ theme }): string => theme.colors.primary};
  }
`;
