import { Plan } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';

const STRIPE_HOBBY_URI = '';
const STRIPE_PRO_URI = '';

export const Route = createFileRoute('/_auth/_global/settings/billing/')({
  component: Component,
});

function Component() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
      <Plan
        to={STRIPE_HOBBY_URI}
        title="Hobby plan"
        price={10}
        description="I think we should describe who this plan is for. e.g. for people that want to manage a single server."
        items={['hundred thousand functions', 'Access to roles', 'lorem ipsum', 'lorem ipsum']}
        buttonText="Get started"
      />

      <Plan
        to={STRIPE_PRO_URI}
        title="Pro plan"
        price={20}
        description="I think we should describe who this plan is for. e.g. for people that want to manage a single server."
        items={['1 million functions included', 'Access to Module builder', 'lorem ipsum', 'lorem ipsum']}
        buttonText="Get started"
        highlight
      />
    </div>
  );
}
