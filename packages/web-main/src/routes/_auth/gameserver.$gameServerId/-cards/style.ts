import { styled, Card as CardBase } from '@takaro/lib-components';

export const StyledCard = styled(CardBase)`
  height: 100%;
  width: 100%;
`;

export const Scrollable = styled.div`
  overflow-y: auto;
  max-height: 100%;
  padding-right: ${({ theme }) => theme.spacing[1]};
`;
