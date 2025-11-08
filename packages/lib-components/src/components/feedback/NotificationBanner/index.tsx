import { FC, useState } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '../../../styled';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip } from '../Tooltip';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { shade } from 'polished';

const Container = styled(motion.div)`
  position: sticky;
  background-color: ${({ theme }): string => shade(0.5, theme.colors.primary)};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  will-change: height;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.notificationBanner};

  div {
    display: flex;
    flex-direction: column;
  }

  h3 {
    font-size: 1.5rem;
  }
  p {
    font-size: 1.1rem;
  }

  h3,
  p {
    color: white;
    font-weight: 500;
  }
  svg {
    fill: white;
    cursor: pointer;
  }
`;

export interface NotificationBannerProps {
  title: string;
  description: string;
}

/* What is <NotificationBanner?
  ------------------------------
  It is a sticky component that shows above the headerbar to show a notification and
  can be hidden by clicking the X in the upper right corner.
  IMPORTANT: the component requires a separate div mounted outside of root called with id notification-banner. 
*/

export const NotificationBanner: FC<NotificationBannerProps> = ({ title, description }) => {
  const [visible, setVisible] = useState<boolean>(true);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <Container initial={{ y: -40 }} animate={{ y: 0 }} exit={{ opacity: '0' }}>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <CloseIcon onClick={() => setVisible(false)} size={18} />
            </Tooltip.Trigger>
            <Tooltip.Content>Close</Tooltip.Content>
          </Tooltip>
        </Container>
      )}
    </AnimatePresence>,
    document.querySelector('#notification-banner') as Element,
  );
};
