import { forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { useTabsContext } from './Context';
const Container = styled.div``;

interface ContentProps {
  asChild?: boolean;
  value: string;
}

export const Content = forwardRef<HTMLDivElement, PropsWithChildren<ContentProps>>(({ children, value }, ref) => {
  const { value: selectedValue } = useTabsContext();

  const isHidden = value !== selectedValue;

  return (
    <Container ref={ref} role="tabpanel" aria-labelledby={`tab-content-${value}`} hidden={isHidden}>
      {children}
    </Container>
  );
});
