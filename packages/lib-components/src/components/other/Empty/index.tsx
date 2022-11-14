import { FC, ReactNode, CSSProperties, ReactElement } from 'react';
import { Size, styled } from '../../../styled';

const Container = styled.div<{ border: 'dashed' | 'none'; size: Size }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min-content;
  ${({ theme, border }) => {
    switch (border) {
      case 'dashed':
        return `border: .4rem dashed ${theme.colors.background}`;
      case 'none':
        return '';
    }
  }};

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 0.225rem;
          border-radius: 0.5rem;
        `;
      case 'small':
        return `
          padding: 0.5rem;
          border-radius: 0.5rem;
        `;
      case 'medium':
        return `
          padding: 2rem;
          border-radius: .7rem
        `;
      case 'large':
        return `
          padding: 6rem;
          border-radius: .8rem
        `;
      case 'huge':
        return `
          border-radius: 1rem;
          padding: 10rem 12rem
        `;
    }
  }};
`;

const Header = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
`;

const ImageContainer = styled.div<{ customStyle?: CSSProperties }>`
  margin-bottom: 1rem;
  svg {
    margin: auto;
  }
`;

const Description = styled.p`
  margin-top: 0.5rem;
  color: gray;
  white-space: nowrap;
`;

export interface EmptyProps {
  header: string;
  description?: string;
  primaryAction?: ReactElement;
  secondaryAction?: ReactElement;
  tertiaryAction?: ReactElement;
  image?: ReactNode;
  /* To style the image container and children */
  imageStyle?: CSSProperties;
  border?: 'dashed' | 'none';
  size?: Size;
}

export const Empty: FC<EmptyProps> = ({
  description = 'No Data',
  header,
  image,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  border = 'none',
  size = 'medium',
}) => {
  return (
    <Container border={border} size={size}>
      {image && <ImageContainer>{image}</ImageContainer>}
      <Header>{header}</Header>
      <Description>{description}</Description>
      <ButtonContainer>
        {primaryAction && primaryAction}
        {secondaryAction && secondaryAction}
        {tertiaryAction && tertiaryAction}
      </ButtonContainer>
    </Container>
  );
};
