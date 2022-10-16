import { forwardRef } from 'react';
import { styled } from '../../../../styled';
import { useTheme } from '../../../../hooks';
import { FiWifi as WifiIcon, FiWifiOff as WifiOffIcon } from 'react-icons/fi';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { CustomContentProps, useSnackbar } from 'notistack';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem;
  border-radius: 10px;
  width: 300px;
  background-color: white;
  box-shadow: ${({ theme }): string => theme.shadows.default};
  p {
    font-size: 1.325rem;
  }
`;
const CloseIconContainer = styled.div`
  border-radius: 50%;
  padding: 0.3rem;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }): string => theme.colors.background};
    svg {
      fill: white;
      stroke: white;
    }
  }
`;

export const NetworkDetectorOfflineSnack = forwardRef<HTMLDivElement, CustomContentProps>(
  ({ id, message }, ref) => {
    const { closeSnackbar } = useSnackbar();

    const handleClose = () => {
      closeSnackbar(id);
    };

    return (
      <Container ref={ref}>
        <WifiOffIcon size={18} style={{ stroke: 'black' }} />
        <p>{message}</p>
        <CloseIconContainer>
          <CloseIcon onClick={handleClose} size={18} style={{ cursor: 'pointer' }} />
        </CloseIconContainer>
      </Container>
    );
  }
);

export const NetworkDetectorOnlineSnack = forwardRef<HTMLDivElement, CustomContentProps>(
  ({ id, message }, ref) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();

    const handleClose = () => {
      closeSnackbar(id);
    };

    return (
      <Container ref={ref}>
        <WifiIcon size={20} style={{ stroke: theme.colors.success }} />
        <p>{message}</p>
        <CloseIconContainer>
          <CloseIcon onClick={handleClose} size={18} style={{ cursor: 'pointer' }} />
        </CloseIconContainer>
      </Container>
    );
  }
);
