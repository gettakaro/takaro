import { CustomContentProps, useSnackbar } from 'notistack';
import { useState, forwardRef, ReactElement } from 'react';
import { styled } from '../../../../styled';
import { AiOutlineClose as CloseIcon, AiOutlineDown as ArrowDownIcon } from 'react-icons/ai';

const Wrapper = styled.div`
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: 10px;
  width: 300px;
`;

const Container = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 1.2rem;
  border-radius: 10px;

  ${({ expanded }) => {
    if (expanded) {
      return `
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      `;
    }
  }}
  h5 {
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
  }
  svg {
    fill: white;
    stroke: white;
    cursor: pointer;
    margin: 0 4px;
  }
`;

const Content = styled.div<{ expanded: boolean }>`
  background-color: white;
  height: ${({ expanded }): string => (expanded ? 'auto' : '0')};
  padding: ${({ expanded }): string => (expanded ? '1.2rem' : '0')};
  will-change: height;
  transition: height 0.2s ease-in-out;
  overflow: hidden;
  border-radius: 10px;
`;

export interface DrawerSnackProps extends CustomContentProps {
  children: ReactElement | ReactElement[]
}

export const DrawerSnack = forwardRef<HTMLDivElement, DrawerSnackProps>(
  ({ id, message, children }, ref) => {
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleClose = () => {
      closeSnackbar(id);
    };

    return (
      <Wrapper ref={ref}>
        <Container expanded={expanded}>
          <h5>{message}</h5>
          <div>
            <ArrowDownIcon onClick={() => setExpanded(!expanded)} size={20} />
            <CloseIcon onClick={handleClose} size={20} />
          </div>
        </Container>
        <Content expanded={expanded}>{children}</Content>
      </Wrapper>
    );
  }
);
