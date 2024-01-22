import { createContext, useContext } from 'react';

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
} | null;

export const AvatarContext = createContext<AvatarContextValue>(null);

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);

  if (context == null) {
    throw new Error('Avatar components must be wrapped in <Avatar />');
  }

  return context;
};
