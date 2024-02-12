import { Outlet, createFileRoute } from '@tanstack/react-router';
import { styled, HorizontalNav } from '@takaro/lib-components';
import { ErrorBoundary } from 'components/ErrorBoundary';

export const Route = createFileRoute('/_auth/_settings')({
  component: Component,
});

const Container = styled.div`
  height: 100%;
`;
const ContentContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing[2]};
`;

function Component() {
  // TODO: should navigate to the first link in the list when the user navigates to /settings
  // const navigate = useNavigate();
  /*
  useEffect(() => {
    if (location.pathname === PATHS.settings.overview()) {
      navigate({ to: PATHS.settings.GameServerSettings() });
    }
  }, [location, navigate]);
  */

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
