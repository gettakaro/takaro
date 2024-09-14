import { createFileRoute } from '@tanstack/react-router';
import { Plan } from '@takaro/lib-components';

const STRIPE_HOBBY_URI = 'https://buy.stripe.com/test_6oEbJO1zXfcZ84E3cn';
const STRIPE_PRO_URI = 'https://buy.stripe.com/test_00g4hm4M99SFacMbIK';

export const Route = createFileRoute('/_auth/_global/settings/billing/plan')({
  component: Component,
});

function Component() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Plan
          to={STRIPE_HOBBY_URI}
          title="Hobby plan"
          price="10"
          description="Perfect for managing a server with your friends!"
          items={[
            'Max servers: 2',
            'Max installed modules per gameserver: 10',
            'Max concurrently running functions: 20',
            'Max roles: 5',
            'Custom modules',
            'Functions included per month: 20k',
          ]}
          buttonText="Get started"
        />
        <Plan
          to={STRIPE_PRO_URI}
          title="Pro plan"
          price="20"
          description="Ideal for dedicated gamers and small communities."
          items={[
            'Max servers: 5',
            'Max installed modules per gameserver: 20',
            'Max concurrently functions: 20',
            'Max roles: 10',
            'Custom modules',
            'Functions includes per month: 100k',
          ]}
          buttonText="Get started"
          highlight
        />
        <Plan
          to="https://support@takaro.io"
          title="Enterprise Plan"
          description="Ideal for dedicated gamers and small communities."
          items={[
            'Max servers: 5',
            'Max installed modules per gameserver: 20',
            'Max concurrently functions: 20',
            'Max roles: 10',
            'Functions includes per month: 100k',
          ]}
          buttonText="Talk to sales"
        />
      </div>
    </>
  );
}
