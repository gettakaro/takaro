import {
  Children,
  FC,
  forwardRef,
  ImgHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Size } from '../../../styled/types';
import { Container, GroupContainer } from './style';
import { AvatarContext, ImageLoadingStatus, useAvatarContext } from './context';
import { useCallbackRef } from '../../../hooks';
import { useImageLoadingStatus } from './useImageLoadingStatus';
import { Skeleton } from '../../../components';

// * -------------------------------------------------------------------------------------------------
// * Avatar Image
// * -----------------------------------------------------------------------------------------------*/

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ onLoadingStatusChange, src, ...imageProps }, ref) => {
    const context = useAvatarContext();
    const imageLoadingStatus = useImageLoadingStatus(src);
    const handleLoadingStatusChange = useCallbackRef((status: ImageLoadingStatus) => {
      onLoadingStatusChange && onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });

    useLayoutEffect(() => {
      if (imageLoadingStatus !== 'idle') {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);

    if (imageLoadingStatus === 'loading') {
      return <Skeleton variant="circular" width="100%" height="100%" />;
    }

    return imageLoadingStatus === 'loaded' ? <img {...imageProps} ref={ref} src={src} /> : null;
  },
);

// * -------------------------------------------------------------------------------------------------
// * FallBack
// * -----------------------------------------------------------------------------------------------*/

interface AvatarFallBackProps {
  delayMs?: number;
}

export const AvatarFallBack = forwardRef<HTMLSpanElement, PropsWithChildren<AvatarFallBackProps>>(
  ({ children, delayMs = 250 }, ref) => {
    const { imageLoadingStatus } = useAvatarContext();
    const [canRender, setCanRender] = useState(delayMs === undefined);

    useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);

    return canRender && imageLoadingStatus !== 'loaded' ? <span ref={ref}>{children}</span> : null;
  },
);

// * -------------------------------------------------------------------------------------------------
// * FallBack
// * -----------------------------------------------------------------------------------------------*/

export interface AvatarGroupProps {
  /// Max amount of avatars that should be shown
  max?: number;
  /// Unstack avatar on hover
  unstackOnHover?: boolean;
}

export const AvatarGroup: FC<PropsWithChildren<AvatarGroupProps>> = ({ max = 3, children, unstackOnHover = false }) => {
  // get size of first child
  const size = (Children.toArray(children)[0] as ReactElement<AvatarProps>).props.size;

  return (
    <GroupContainer size={size ?? 'medium'} unStackOnHover={unstackOnHover}>
      {Children.toArray(children).slice(0, Math.min(Children.count(children), max))}
    </GroupContainer>
  );
};

// * -------------------------------------------------------------------------------------------------
// * Avatar
// * -----------------------------------------------------------------------------------------------*/

interface SubComponentTypes {
  FallBack: typeof AvatarFallBack;
  Image: typeof AvatarImage;
  Group: typeof AvatarGroup;
}

export type AvatarVariant = 'square' | 'rounded' | 'circle';

export interface AvatarProps {
  size?: Size;
  variant?: AvatarVariant;
}

// TODO: skeleton loading
export const Avatar: FC<PropsWithChildren<AvatarProps>> & SubComponentTypes = ({
  size = 'medium',
  variant,
  children,
}) => {
  const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageLoadingStatus>('idle');

  return (
    <AvatarContext.Provider value={{ imageLoadingStatus, onImageLoadingStatusChange: setImageLoadingStatus }}>
      <Container size={size} variant={variant}>
        {children}
      </Container>
    </AvatarContext.Provider>
  );
};

Avatar.FallBack = AvatarFallBack;
Avatar.Image = AvatarImage;
Avatar.Group = AvatarGroup;
