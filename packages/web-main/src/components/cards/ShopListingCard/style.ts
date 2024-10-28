import { styled } from '@takaro/lib-components';

export const Header = styled.div<{ hasMultipleChildren: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ hasMultipleChildren }) => (hasMultipleChildren ? 'space-between' : 'flex-end')};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 250px;
  height: 100%;

  h2 {
    max-width: 200px;
    margin-bottom: ${({ theme }) => theme.spacing['1']};
    margin-top: ${({ theme }) => theme.spacing['1']};
    text-transform: capitalize;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
  }
`;

export const Image = styled.img`
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  margin-bottom: ${({ theme }) => theme.spacing['1_5']};
`;
