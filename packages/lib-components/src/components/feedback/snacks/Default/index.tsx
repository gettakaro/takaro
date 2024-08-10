import { forwardRef, FC, ReactElement, cloneElement, useCallback } from 'react';
import { CustomContentProps, useSnackbar } from 'notistack';
import {
  AiOutlineClose as CloseIcon,
  AiOutlineWarning as WarningIcon,
  AiOutlineInfo as InfoIcon,
  AiOutlineCheck as CheckMarkIcon,
  AiOutlineMeh as ErrorIcon,
} from 'react-icons/ai';

import { Wrapper, ContentContainer, TextContainer, IconContainer, ButtonContainer } from './style';
import { useTheme } from '../../../../hooks';
import { ButtonProps, IconButton, Tooltip } from '../../../../components';
import { AlertVariants } from '../../../../styled';

/* IMPORTANT: These props need to be kept in sync with the props defined in helpers/getSnackbarProvider */
export interface DefaultSnackProps extends CustomContentProps {
  title?: string;
  button1?: FC<ButtonProps>;
  button2?: FC<ButtonProps>;
  type?: AlertVariants;
  icon?: ReactElement;
}

export const DefaultSnack = forwardRef<HTMLDivElement, DefaultSnackProps>(function DefaultSnack(
  { id, message, title, button1, button2, type = 'info', icon },
  ref,
) {
  const { closeSnackbar } = useSnackbar();
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoIcon fill={theme.colors.info} size={15} />;
      case 'success':
        return <CheckMarkIcon fill={theme.colors.success} size={15} />;
      case 'warning':
        return <WarningIcon fill={theme.colors.warning} size={15} />;
      case 'error':
        return <ErrorIcon fill={theme.colors.warning} size={15} />;
    }
  };

  const handleDismiss = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  return (
    <Wrapper ref={ref}>
      <ContentContainer>
        <IconContainer variant={type}>
          {icon ? cloneElement(icon, { size: 15, fill: theme.colors[type] }) : getIcon()}
        </IconContainer>
        <TextContainer>
          {title && <h3>{title}</h3>}
          <h5>{message}</h5>
          {button1 && (
            <ButtonContainer>
              <>
                {button1}
                {button2 && button2}
              </>
            </ButtonContainer>
          )}
        </TextContainer>
        <div style={{ width: '25px' }}>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <IconButton icon={<CloseIcon />} ariaLabel="Dismiss snack popup" onClick={handleDismiss} />
            </Tooltip.Trigger>
            <Tooltip.Content>Dismiss</Tooltip.Content>
          </Tooltip>
        </div>
      </ContentContainer>
    </Wrapper>
  );
});
