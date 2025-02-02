import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { styled, HorizontalNav } from '@takaro/lib-components';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/settings')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_SETTINGS'])) {
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
        <Link to="/settings/gameservers">Global Game Server Settings</Link>
        <Link to="/settings/discord">Discord integration</Link>
        <Link to="/settings/billing" search={{ period: 'monthly' }}>
          Billing
        </Link>
      </HorizontalNav>
      <ContentContainer>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </ContentContainer>
    </Container>
  );
}
