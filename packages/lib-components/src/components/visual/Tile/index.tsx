import { FC } from 'react';
import { Color, AlertVariants } from '../../../styled';
import { Loading } from '../../feedback';
import { Container, ContentContainer } from './style';

export interface TileProps {
  loading?: boolean;
  bgColor: Color | AlertVariants | 'white';
  title?: string;
  description?: string;
  textColor: Color | AlertVariants | 'white';
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => any | void;
}

export const Tile: FC<TileProps> = ({
  loading = false,
  bgColor,
  title,
  description,
  textColor,
  onClick
}) => {
  function isClickable(): boolean {
    return typeof onClick === 'function' ? true : false;
  }

  return (
    <Container
      $loading={loading}
      bgColor={bgColor}
      clickable={isClickable()}
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void =>
        typeof onClick === 'function' ? onClick(e) : null
      }
    >
      {loading ? (
        <Loading />
      ) : (
        <ContentContainer textColor={textColor}>
          <h4>{title}</h4>
          <p>{description}</p>
        </ContentContainer>
      )}
    </Container>
  );
};
