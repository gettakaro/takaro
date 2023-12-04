import { ErrorPage } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PATHS } from 'paths';

const Forbidden = () => {
  useDocumentTitle('Forbidden');
  return (
    <ErrorPage
      errorCode={403}
      title="Forbidden"
      description="You are not authorized to view this page. Contact your server admin to request access."
      homeRoute={PATHS.home()}
    />
  );
};

export default Forbidden;
