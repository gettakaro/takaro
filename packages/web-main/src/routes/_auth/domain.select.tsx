import { Card, Chip, Company, styled } from '@takaro/lib-components';
import { DomainOutputDTO } from '@takaro/apiclient';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUserSetSelectedDomain, userMeQueryOptions } from 'queries/user';
import { MdDomain as DomainIcon } from 'react-icons/md';
import { AiOutlineArrowRight as ArrowRightIcon } from 'react-icons/ai';
import { useQueryClient } from '@tanstack/react-query';

export const TAKARO_DOMAIN_COOKIE_REGEX = /(?:(?:^|.*;\s*)takaro-domain\s*=\s*([^;]*).*$)|^.*$/;

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  height: 100vh;
`;

const DomainCardList = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  width: 450px;
  gap: ${({ theme }) => theme.spacing[2]};
  height: 85vh;
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 500px;
  height: 100px;
`;

export const Route = createFileRoute('/_auth/domain/select')({
  component: Component,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(userMeQueryOptions());
  },
});

function Component() {
  const me = Route.useLoaderData();
  const currentDomain = document.cookie.replace(TAKARO_DOMAIN_COOKIE_REGEX, '$1');

  // Keep current domain at the top
  me.domains.sort((a, b) => {
    if (a.id === currentDomain) {
      return -1;
    }
    if (b.id === currentDomain) {
      return 1;
    }
    return 0;
  });

  return (
    <Container>
      <Company />
      <DomainCardList>
        <h2>Select a domain:</h2>
        {me.domains.map((domain) => (
          <>
            <DomainCard domain={domain} isCurrentDomain={currentDomain === domain.id} />
          </>
        ))}
      </DomainCardList>
    </Container>
  );
}

interface DomainCardProps {
  domain: DomainOutputDTO;
  isCurrentDomain: boolean;
}

function DomainCard({ domain, isCurrentDomain }: DomainCardProps) {
  const navigate = useNavigate();
  const { mutate, isSuccess } = useUserSetSelectedDomain();
  const queryClient = useQueryClient();

  const handleDomainSelectedClick = () => {
    if (isCurrentDomain === false) {
      mutate({ domainId: domain.id });
    }
  };

  if (isSuccess) {
    queryClient.clear();
    navigate({ to: '/dashboard' });
  }

  return (
    <Card role="link" onClick={handleDomainSelectedClick}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <DomainIcon size={30} />
          {isCurrentDomain && <Chip variant="outline" color="primary" label="current domain" />}
        </div>
        <h2 style={{ display: 'flex', alignItems: 'center' }}>
          {domain.name}
          <ArrowRightIcon size={18} style={{ marginLeft: '10px' }} />
        </h2>
        <div></div>
      </CardBody>
    </Card>
  );
}
