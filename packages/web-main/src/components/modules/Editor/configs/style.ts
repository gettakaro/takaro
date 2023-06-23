import { Button, styled } from '@takaro/lib-components';

export const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const StyledTest = styled.div`
  width: 100%;
  display: flex;
`;

export const ArgumentList = styled.ul`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-direction: column;
  align-items: center;
`;

export const ArgumentCard = styled.li`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  }
`;

export const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const Flex = styled.div<{ direction?: 'row' | 'column' }>`
  width: 100%;
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing[1]};
`;
