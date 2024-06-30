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
  height: 400px;
`;

export const Image = styled.img`
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  margin-bottom: ${({ theme }) => theme.spacing['1_5']};
`;
