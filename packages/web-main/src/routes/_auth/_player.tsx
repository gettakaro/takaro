import { Outlet, createFileRoute } from '@tanstack/react-router';
import { styled } from '@takaro/lib-components';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
`;

export const Route = createFileRoute('/_auth/_player')({
  component: Component,
});

function Component() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}
