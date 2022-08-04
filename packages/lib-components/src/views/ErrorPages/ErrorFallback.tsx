import { FC } from 'react';
import { ErrorTemplate } from '../../components';

export const ErrorFallback: FC = () => (
  <ErrorTemplate description="Something went wrong." title="WOOPS" />
);
