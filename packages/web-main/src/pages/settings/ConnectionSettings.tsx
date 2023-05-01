import { ConnectionCard } from 'components/ConnectionCard';
import { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import { styled } from '@takaro/lib-components';

const ConnectionList = styled.ul``;

export const ConnectionSettings = () => {
  const connections = [{ name: 'Discord' }, { name: 'Google' }];

  return (
    <Fragment>
      <Helmet>
        <title>Settings - Takaro</title>
      </Helmet>
      <ConnectionList>
        {connections.map((connection) => (
          <ConnectionCard {...connection} />
        ))}
      </ConnectionList>
    </Fragment>
  );
};
