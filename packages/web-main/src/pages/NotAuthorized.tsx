import { ErrorPage } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PATHS } from 'paths';

const NotAuthorized = () => {
  useDocumentTitle('Not authorized');
  return (
    <ErrorPage
      errorCode={40}
      title="Not authorized"
      description="You are not authorized to view this page. Contact your server administrator to request access."
      homeRoute={PATHS.home()}
    />
  );
};

export default NotAuthorized;
