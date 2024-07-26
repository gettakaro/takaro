import { FC, ReactElement } from 'react';
import { Size, styled } from '../../../styled';

const Container = styled.div<{ size: Size }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 600px;

  svg {
    fill: ${({ theme }) => theme.colors.primary};
  }

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

const ActionContainer = styled.div`
  display: grid;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[2]};
  justify-content: center;
  align-content: center;
  grid-auto-rows: auto;
  grid-auto-flow: column;
`;

const Description = styled.p`
  max-width: 300px;
  margin: 0.5rem auto 1rem auto;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export const EmptyPage = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  height: 100%;
  width: 100%;
`;

export interface EmptyProps {
  header: string;
  description: string;
  actions: ReactElement[];
  size?: Size;
}

export const Empty: FC<EmptyProps> = ({ description = 'No Data', header, actions, size = 'medium' }) => {
  return (
    <Container size={size}>
      <h2>{header}</h2>
      <Description>{description}</Description>
      <ActionContainer>{actions}</ActionContainer>
    </Container>
  );
};
