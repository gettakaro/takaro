import { CustomContentProps, useSnackbar } from 'notistack';
import { useState, forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../../styled';
import {
  AiOutlineClose as CloseIcon,
  AiOutlineDown as ArrowDownIcon,
} from 'react-icons/ai';

const Wrapper = styled.div`
  box-shadow: ${({ theme }) => theme.elevation[4]};
  border-radius: 1rem;
  width: 300px;
`;

const Container = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: 1rem;

  ${({ expanded }) => {
    if (expanded) {
      return `
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      `;
    }
  }}
  h4 {
    font-weight: 700;
  }
  svg {
    fill: white;
    stroke: white;
    cursor: pointer;
    padding: ${({ theme }) => `0 ${theme.spacing['0_5']}`};
  }
`;

const Content = styled.div<{ expanded: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  height: ${({ expanded }): string => (expanded ? 'auto' : '0')};
  padding: ${({ expanded, theme }): string =>
    expanded ? theme.spacing[1] : theme.spacing[0]};
  will-change: height;
  transition: height 0.2s ease-in-out;
  overflow: hidden;
  border-radius: 1rem;
`;

export const DrawerSnack = forwardRef<
  HTMLDivElement,
  PropsWithChildren<CustomContentProps>
>(({ id, message, children }, ref) => {
  const { closeSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleClose = () => {
    closeSnackbar(id);
  };

  return (
    <Wrapper ref={ref}>
      <Container expanded={expanded}>
        <h4>{message}</h4>
        <div>
          <ArrowDownIcon onClick={() => setExpanded(!expanded)} size={20} />
          <CloseIcon onClick={handleClose} size={20} />
        </div>
      </Container>
      <Content expanded={expanded}>{children}</Content>
    </Wrapper>
  );
});
