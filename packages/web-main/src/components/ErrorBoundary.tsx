import { FC, PropsWithChildren } from 'react';
import { ErrorBoundary as Boundary } from '@sentry/react';
import { ErrorFallback } from '@takaro/lib-components';

export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Boundary showDialog fallback={<ErrorFallback />}>
      {children}
    </Boundary>
  );
};
