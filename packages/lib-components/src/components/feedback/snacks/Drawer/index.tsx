import { CustomContentProps, useSnackbar } from 'notistack';
import { useState, forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../../styled';
import { AiOutlineClose as CloseIcon, AiOutlineDown as ArrowDownIcon } from 'react-icons/ai';

const Wrapper = styled.div`
  box-shadow: ${({ theme }) => theme.elevation[4]};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: 250px;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
`;

const Container = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.large};

  ${({ expanded }) => {
    if (expanded) {
      return `
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      `;
    }
  }}
  svg {
    cursor: pointer;
    padding: ${({ theme }) => `0 ${theme.spacing['0_5']}`};
  }
`;

const Content = styled.div<{ expanded: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  height: ${({ expanded }): string => (expanded ? 'auto' : '0')};
  padding: ${({ expanded, theme }): string => (expanded ? theme.spacing[1] : theme.spacing[0])};
  will-change: height;
  transition: height 0.2s ease-in-out;
  overflow: hidden;
  border-radius: ${({ theme }) => `0 0 ${theme.borderRadius.large} ${theme.borderRadius.large}`};
  border-radius-top-left: 0;
  border-radius-top-right: 0;
`;

export const DrawerSnack = forwardRef<HTMLDivElement, PropsWithChildren<CustomContentProps>>(
  ({ id, message, children }, ref) => {
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleClose = () => {
      closeSnackbar(id);
    };

    return (
      <Wrapper ref={ref} data-testid={id}>
        <Container expanded={expanded}>
          <h4>{message}</h4>
          <div>
            <ArrowDownIcon onClick={() => setExpanded(!expanded)} size={16} />
            <CloseIcon onClick={handleClose} size={16} />
          </div>
        </Container>
        <Content expanded={expanded}>{children}</Content>
      </Wrapper>
    );
  },
);
