import { forwardRef, useEffect, useRef } from 'react';
import { styled } from '../../../styled';

const Container = styled.button`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 0;
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  text-align: left;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSize.small};
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1_5']}`};

  display: grid;
  grid-template-columns: auto 50px auto; /* This creates the layout with 30px space between spans */
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  disabled?: boolean;
}

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(({ label, shortcut, disabled, ...props }, ref) => {
  // Create a ref for the container
  const containerRef = useRef<HTMLButtonElement>(null);

  // Use useEffect to calculate the total width when the component mounts or when label or shortcut changes
  useEffect(() => {
    if (containerRef.current) {
      const labelSpan = containerRef.current.children[0] as HTMLSpanElement;
      const shortcutSpan = containerRef.current.children[1] as HTMLSpanElement;

      // Calculate the total width of the spans plus the desired spacing (30px)
      const totalWidth = labelSpan.offsetWidth + shortcutSpan.offsetWidth + 60;

      // Set the calculated total width as the min-width of the container
      containerRef.current.style.minWidth = `${totalWidth}px`;
    }
  }, [label, shortcut]);

  return (
    <Container {...props} ref={ref} role="menuitem" disabled={disabled}>
      <span>{label}</span>
      <span></span>
      <span style={{ textAlign: 'right' }}>{shortcut}</span>
    </Container>
  );
});
