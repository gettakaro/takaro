import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { Size } from '../../../styled/types';

const Container = styled.div<{ src?: string; size: Size; isCircle: boolean }>`
  border-radius: ${({ isCircle }): string => (isCircle ? '50%' : '30%')};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;

  ${({ src, theme }): string => {
    return src
      ? `background-image: url(${src});`
      : `background-color: ${theme.colors.background};
         border: 1px solid ${theme.colors.backgroundAccent};`;
  }}

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
        return `
          width: 2.4rem;
          height: 2.4rem;
          font-size: .8rem;
        `;
      case 'small':
        return `
          width: 3.125rem;
          height: 3.125rem;
          font-size: ${theme.fontSize.small};
        `;
      case 'medium':
        return `
          width: 6rem;
          height: 6rem;
          font-size: 2rem;
        `;
      case 'large':
        return `
          width: 14rem;
          height: 14rem;
          font-size: 2.8rem;
        `;
      case 'huge':
        return `
          width: 20rem;
          height: 20rem;
          font-size: 3rem;
        `;
    }
  }}
`;

export interface AvatarProps {
  alt: string;
  src?: string;
  size?: Size;
  isCircle?: boolean;
}

// TODO: skeleton loading
export const Avatar: FC<PropsWithChildren<AvatarProps>> = ({
  size = 'medium',
  alt,
  src = undefined,
  children,
  isCircle = true,
}) => {
  return (
    <Container aria-label={alt} isCircle={isCircle} role="img" size={size} src={src}>
      {children}
    </Container>
  );
};
