import { styled } from '@takaro/lib-components';

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 200px;
  height: 370px;

  h2 {
    max-width: 200px;
    margin-bottom: ${({ theme }) => theme.spacing['1']};
    margin-top: ${({ theme }) => theme.spacing['1']};
    text-transform: capitalize;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const Image = styled.img`
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  margin-bottom: ${({ theme }) => theme.spacing['1_5']};
`;
