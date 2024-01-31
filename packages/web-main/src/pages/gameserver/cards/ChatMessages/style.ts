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
`;
