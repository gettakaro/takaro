import { styled } from '@takaro/lib-components';

export const Message = styled.span`
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: grid;
  grid-template-columns: 36px auto 1fr;
  gap: ${({ theme }) => theme.spacing['0_75']};
  align-items: center;
  padding: ${({ theme }) => theme.spacing['0_5']};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[1]};
  height: 100%;
`;
