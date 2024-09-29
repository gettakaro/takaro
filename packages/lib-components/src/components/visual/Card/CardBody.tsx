import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing[2]};
  min-width: 20rem;
`;

export const CardBody: FC<PropsWithChildren> = (props) => {
  return <Container>{props.children}</Container>;
};
