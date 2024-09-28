import { styled } from '@takaro/lib-components';

export const SocialContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const Scrollable = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
`;

export const ChipContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const Social = styled.div``;
