/// Contains the triggers that are aligend along the edge of the active content
import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

const Container = styled.div`
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
`;

export const List: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container role="tablist" aria-orientation="horizontal">
      {children}
    </Container>
  );
};
