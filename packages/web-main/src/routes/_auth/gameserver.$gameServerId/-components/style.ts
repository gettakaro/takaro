import { styled } from '@takaro/lib-components';

export const Scrollable = styled.div`
  overflow-y: auto;
  max-height: 100%;
  padding-right: ${({ theme }) => theme.spacing[1]};
`;
