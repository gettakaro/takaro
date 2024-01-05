import { styled } from '@takaro/lib-components';

export const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  img,
  svg {
    width: ${({ theme }) => theme.spacing[2]}!important;
    height: ${({ theme }) => theme.spacing[2]}!important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    fill: ${({ theme }) => theme.colors.primary};
  }
`;

export const StatusDot = styled.div<{ isReachable: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 3px;
  margin-left: ${({ theme }) => theme.spacing['0_75']};
  background-color: ${({ isReachable, theme }) => (isReachable ? theme.colors.success : theme.colors.error)};
`;
