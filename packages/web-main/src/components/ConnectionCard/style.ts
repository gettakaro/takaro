import { styled } from '@takaro/lib-components';

export const Container = styled.a`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  margin: ${({ theme }) => theme.spacing[1]} 0;
  height: 150px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing[1]};
`;
