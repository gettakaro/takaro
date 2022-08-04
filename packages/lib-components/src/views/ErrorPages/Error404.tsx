import { FC } from 'react';
import { ErrorTemplate } from '../../components';

export const Error404: FC = () => (
  <ErrorTemplate description="The page could not be found." title="404" />
);
