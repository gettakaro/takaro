import { FC } from 'react';
import { Skeleton, styled } from '@takaro/lib-components';

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export const ConfigLoading: FC = () => {
  return (
    <SkeletonWrapper>
      <Skeleton width="100%" variant="text" />
      <Skeleton width="100%" height="150px" variant="text" />
      <Skeleton width="100%" variant="text" />
      <Skeleton width="100%" variant="text" />
    </SkeletonWrapper>
  );
};
