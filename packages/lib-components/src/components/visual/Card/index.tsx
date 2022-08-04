import { FC } from 'react';
import { styled } from '../../../styled';

const Template = styled.div<{ gradient: boolean }>`
  background: ${({ theme, gradient }) => (gradient ? theme.colors.primary : 'white')};
  border-radius: 0.6rem;
  margin: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.default};
  color: ${({ theme, gradient }) => (gradient ? 'white' : theme.colors.text)};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  div {
    color: ${({ theme, gradient }) => (gradient ? 'white' : theme.colors.text)}!important;
  }
`;

const Small = styled(Template)`
  padding: 0.5rem;
`;
const Medium = styled(Template)`
  padding: 1.5rem;
`;
const Large = styled(Template)`
  padding: 2.5rem;
`;

export interface CardProps {
  gradient?: boolean;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

// TODO: implement skeleton loading
export const Card: FC<CardProps> = ({
  children,
  loading = false,
  gradient = false,
  size = 'medium'
}) => {
  switch (size) {
    case 'small':
      return <Small gradient={gradient}>{children}</Small>;
    case 'medium':
      return <Medium gradient={gradient}>{children}</Medium>;
    case 'large':
      return <Large gradient={gradient}>{children}</Large>;
  }
};
