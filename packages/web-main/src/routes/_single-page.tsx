import { createFileRoute, Outlet } from '@tanstack/react-router';
import { styled } from '@takaro/lib-components';

export const Route = createFileRoute('/_single-page')({
  component: LayoutComponent,
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200px);
  margin-top: 200px;
`;

function LayoutComponent() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}
