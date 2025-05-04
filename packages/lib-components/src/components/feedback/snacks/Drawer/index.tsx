import { CustomContentProps, useSnackbar } from 'notistack';
import { useState, forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../../styled';
import { AiOutlineClose as CloseIcon, AiOutlineDown as ArrowDownIcon } from 'react-icons/ai';
import { Tooltip } from '../../../../components';

const Wrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: 300px;
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

  h4 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export const DrawerSnack = forwardRef<HTMLDivElement, PropsWithChildren<CustomContentProps>>(function DrawerSnack(
  { id, message, children },
  ref,
) {
  const { closeSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleClose = () => {
    closeSnackbar(id);
  };

  return (
    <Wrapper ref={ref} data-testid={id}>
      <Container expanded={expanded}>
        <h4>{message}</h4>
        <div style={{ display: 'flex' }}>
          <Tooltip placement="top">
            <Tooltip.Trigger>
              <ArrowDownIcon onClick={() => setExpanded(!expanded)} size={16} />
            </Tooltip.Trigger>
            <Tooltip.Content>{expanded ? 'Collapse' : 'Expand'}</Tooltip.Content>
          </Tooltip>
          <Tooltip placement="top">
            <Tooltip.Trigger>
              <CloseIcon onClick={handleClose} size={16} />
            </Tooltip.Trigger>
            <Tooltip.Content>Close</Tooltip.Content>
          </Tooltip>
        </div>
      </Container>
      <Content expanded={expanded}>{children}</Content>
    </Wrapper>
  );
});
