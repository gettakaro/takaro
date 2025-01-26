import { styled } from '@takaro/lib-components';

export const Header = styled.div`
  margin: ${({ theme }) => `${theme.spacing[2]} 0 ${theme.spacing[1]} 0`};
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    h3 {
      text-transform: capitalize;
      margin-left: 5px;
    }
  }
`;

export const Inner = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};

  p {
    color: ${({ theme }) => theme.colors.textAlt};
    text-transform: lowercase;
  }
`;
