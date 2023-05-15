import { styled } from '@takaro/lib-components';

export const ArgumentList = styled.ul``;

export const ArgumentCard = styled.li`
  padding: ${({ theme }) => theme.spacing[1]};
`;

export const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 25px 1fr 1fr 1fr 25px;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
`;
