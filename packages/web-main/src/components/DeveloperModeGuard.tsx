import { FC, PropsWithChildren } from 'react';
import { globalGameServerSetingQueryOptions } from '../queries/setting';
import { useQuery } from '@tanstack/react-query';

interface DeveloperModeGuardProps {
  /// When used in loop or iterator, you sometimes want to guard for some of the items but not for all
  enabled?: boolean;
}

export const DeveloperModeGuard: FC<PropsWithChildren<DeveloperModeGuardProps>> = ({ children, enabled = true }) => {
  const { data, isLoading } = useQuery({ ...globalGameServerSetingQueryOptions('developerMode'), enabled });

  if (!enabled) {
    return <>{children}</>;
  }

  if (isLoading || !data || data.value === 'false') {
    return null;
  }

  return <>{children}</>;
};
