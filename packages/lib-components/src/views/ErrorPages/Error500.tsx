import { FC } from 'react';
import { ErrorTemplate } from '../../components';

export const Error500: FC = () => (
  <ErrorTemplate description="A server error occured" title="500" />
);
