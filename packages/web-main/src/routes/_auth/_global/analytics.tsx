import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { styled, HorizontalNav } from '@takaro/lib-components';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { PERMISSIONS } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/_global/analytics')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ManageShopListings])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

const Container = styled.div`
  height: 100%;
`;
const ContentContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing[2]};
`;

function Component() {
  return (
    <Container>
      <HorizontalNav variant="underline">
        <Link to="/analytics/shop">Shop</Link>
      </HorizontalNav>
      <ContentContainer>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </ContentContainer>
    </Container>
  );
}
