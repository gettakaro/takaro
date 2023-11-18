import { ErrorPage } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PATHS } from 'paths';

const NotFound = () => {
  useDocumentTitle('Page not found');
  return (
    <ErrorPage
      errorCode={404}
      title="Page not found"
      description="The page you are looking for does not exist."
      homeRoute={PATHS.home()}
    />
  );
};

export default NotFound;
