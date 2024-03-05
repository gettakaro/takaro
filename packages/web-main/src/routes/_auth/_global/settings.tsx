import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { styled, HorizontalNav } from '@takaro/lib-components';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/settings')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_SETTINGS'])) {
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
      <HorizontalNav
        links={[
          {
            text: 'Global Game Server Settings',
            // If serverId is not valid it will be directed by the failed requests.
            to: '/settings/gameservers',
          },
          {
            text: 'Discord',
            to: '/settings/discord',
          },
        ]}
        variant="underline"
      />
      <ContentContainer>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </ContentContainer>
    </Container>
  );
}
