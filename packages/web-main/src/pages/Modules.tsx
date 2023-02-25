import { FC } from 'react';
import { styled } from '@takaro/lib-components';

import { Helmet } from 'react-helmet';
import { ModulesTable } from 'components/modules/table';

const Page = styled.div`
  padding: 3rem 8rem;
`;

export const Modules: FC = () => {
  return (
    <>
      <Helmet>
        <title>Modules - Takaro</title>
      </Helmet>
      <Page>
        <h1>Available modules</h1>
        <ModulesTable />
      </Page>
    </>
  );
};
