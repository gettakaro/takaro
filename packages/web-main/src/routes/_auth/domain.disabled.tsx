import { Button, Card, Company, styled } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 200px);
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing};
  align-items: center;
  justify-content: space-between;
`;

export const Route = createFileRoute('/_auth/domain/disabled')({
  component: Component,
});

function Component() {
  return (
    <Container>
      <Company size="huge" />
      <Card variant="outline">
        <h1></h1>
        <br />
        <p>
          You have used everything within your free plan. <br /> It will be paused until you upgrade to a paid
          subscription
        </p>
        <p>Get your first moth risk-free. If you do not like it, we will refund you.</p>
        <br />
        <ButtonContainer>
          <Button text="Upgrade to Starter plan" />
          <Button color="primary" variant="clear" text="See all plan options" />
        </ButtonContainer>
      </Card>
    </Container>
  );
}
