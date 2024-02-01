import {
  cloneElement,
  ForwardedRef,
  forwardRef,
  HTMLProps,
  isValidElement,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { useCollapsibleContext } from './CollapsibleContext';
import { AiOutlineCaretRight as ArrowRight, AiOutlineCaretDown as ArrowDown } from 'react-icons/ai';
import { styled } from '../../../styled';

const Container = styled.button<{ open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['1']}`};
  margin-bottom: ${({ theme, open }) => (!open ? theme.spacing['1'] : theme.spacing['0_5'])};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  color: ${({ theme }) => theme.colors.textAlt};

  svg {
    fill: ${({ theme }) => theme.colors.textAlt};
  }
`;

export type TriggerProps = HTMLProps<HTMLElement> & PropsWithChildren<{ asChild?: boolean }>;
export const CollapsibleTrigger = forwardRef<HTMLElement, TriggerProps>(({ children, asChild }, ref) => {
  const { setOpen, open } = useCollapsibleContext();

  const handleClick = () => {
    setOpen(!open);
  };

  if (asChild && isValidElement(children)) {
    const existingOnClick = children.props.onClick;
    const mergedOnClick = () => {
      existingOnClick && existingOnClick();
      handleClick();
    };

    return cloneElement(children as ReactElement, {
      onClick: mergedOnClick,
      role: 'button',
    });
  } else {
  }

  return (
    <Container
      open={open}
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      tabIndex={0}
      ref={ref as ForwardedRef<HTMLButtonElement>}
    >
      {children}
      {open === false && <ArrowRight size={12} />}
      {open === true && <ArrowDown size={12} />}
    </Container>
  );
});
