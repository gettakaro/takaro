import { createFileRoute, Outlet } from '@tanstack/react-router';
import { styled, Company } from '@takaro/lib-components';

export const Route = createFileRoute('/_single-page')({
  component: LayoutComponent,
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 800px;
  margin: 0 auto;
`;

function LayoutComponent() {
  return (
    <Container>
      <Company size="large" />
      <Outlet />
    </Container>
  );
}
