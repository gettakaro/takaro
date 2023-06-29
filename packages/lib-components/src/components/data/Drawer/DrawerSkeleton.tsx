import { Skeleton, Drawer } from '../../../components';
import { styled } from '../../../styled';

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const DrawerSkeleton = () => {
  return (
    <Drawer initialOpen>
      <Drawer.Content>
        <Drawer.Body>
          <Inner>
            <Skeleton width="100%" height="8vh" variant="rectangular" />
            <Skeleton width="100%" height="12vh" variant="rectangular" />
            <Skeleton width="100%" height="5vh" variant="rectangular" />
            <Skeleton width="100%" height="10vh" variant="rectangular" />
            <Skeleton width="100%" height="15vh" variant="rectangular" />
            <Skeleton width="100%" height="16vh" variant="rectangular" />
            <Skeleton width="100%" height="5vh" variant="rectangular" />
          </Inner>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
};
