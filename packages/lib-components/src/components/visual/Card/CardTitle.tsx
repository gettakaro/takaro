import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  padding: ${({ theme }) => theme.spacing[1]};
`;

interface CardTitleProps {
  label: string;
}

export const CardTitle: FC<PropsWithChildren<CardTitleProps>> = (props) => {
  return (
    <Container>
      <h2>{props.label}</h2>
      <div>{props.children}</div>
    </Container>
  );
};
