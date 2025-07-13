import { styled } from '@takaro/lib-components';

export const Message = styled.span`
  display: grid;
  grid-template-columns: 36px auto 1fr;
  gap: ${({ theme }) => theme.spacing['0_75']};
  align-items: center;

  padding: ${({ theme }) => theme.spacing['0_5']};

  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAlt};

  span:nth-child(2) {
    color: ${({ theme }) => theme.colors.text};
    font-weight: bold;
  }
`;

export const EventMessage = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
`;

export const TimeStamp = styled.time`
  color: ${({ theme }) => theme.colors.textAlt};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[1]};
  height: 100%;
  min-height: 400px;
  max-height: 400px;
`;

export const FollowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

export const FollowLabel = styled.label`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ theme }) => theme.fontSize.small};
  cursor: pointer;
`;
