import { styled } from '@takaro/lib-components';

export const ContentContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing['1']};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['4']};
  width: 100%;
`;

export const Flex = styled.div`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const EventFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['1']};
  align-items: center;
  width: 100%;
`;

export const Header = styled.div`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`;

export const Filters = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  padding: ${({ theme }) => `${theme.spacing[2]}`};
  min-height: 600px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  min-width: 360px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
`;

export const ScrollableContainer = styled.div`
  overflow-y: auto;
  display: flex;
  padding-left: 4px;
  padding-right: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  height: 80vh;
`;
