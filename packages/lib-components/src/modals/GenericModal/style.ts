import { styled } from '../../styled';

export const Container = styled.div`
  min-width: 300px;
  border-radius: 2rem;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  svg {
    fill: ${({ theme }) => theme.colors.gray};
  }

  h2 {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 2rem;
    color: ${({ theme }): string => theme.colors.text};
    font-weight: 500;
    }
  }
`;
