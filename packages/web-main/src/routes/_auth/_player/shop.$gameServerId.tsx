import { ErrorBoundary } from '@sentry/react';
import { HorizontalNav, styled } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useForm } from 'react-hook-form';
import { useEffect, FC } from 'react';
import { Link, Outlet, createFileRoute, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { GameServerSelect } from 'components/selects';

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const Route = createFileRoute('/_auth/_player/shop/$gameServerId')({
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  useDocumentTitle('shop');

  return (
    <>
      <Container>
        <HorizontalNav variant={'block'}>
          <Link activeOptions={{ exact: true }} to="/shop/$gameServerId" params={{ gameServerId }}>
            Shop
          </Link>
          <Link activeOptions={{ exact: true }} to="/shop/$gameServerId/orders" params={{ gameServerId }}>
            Orders
          </Link>
        </HorizontalNav>
        <UrlGameServerSelect currentSelectedGameServerId={gameServerId} />
      </Container>
      <ErrorBoundary>
        <div style={{ padding: '10px' }}>
          <Outlet />
        </div>
      </ErrorBoundary>
    </>
  );
}

const UrlGameServerSelect: FC<{ currentSelectedGameServerId: string }> = ({
  currentSelectedGameServerId: selectedGameServerId,
}) => {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const { control, watch } = useForm<{ gameServerId: string }>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: selectedGameServerId,
    },
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const params = matchRoute({
        to: '/shop/$gameServerId',
        fuzzy: true,
      });

      console.log(params);

      if (params !== false) {
        navigate({
          to: `/shop/$gameServerId/${params['**']}`,
          params: {
            gameServerId: value.gameServerId,
          },
          startTransition: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId'), matchRoute]);

  return <GameServerSelect control={control} name="gameServerId" label="" />;
};
