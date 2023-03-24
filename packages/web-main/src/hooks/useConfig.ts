import { useContext } from 'react';
import { ConfigContext, TakaroConfig } from '../context/configContext';

export function useConfig() {
  const config = useContext<TakaroConfig>(ConfigContext);
  return config;
}
