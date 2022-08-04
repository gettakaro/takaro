// TODO: <NotificationBanner/>

import { FC, useState } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '../../../styled';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { AnimatePresence, motion } from 'framer-motion';

const Container = styled(motion.div)`
  position: sticky;
  background-color: ${({ theme }): string => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  overflow: hidden;
  will-change: height;

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
*/

export const NotificationBanner: FC<NotificationBannerProps> = ({ title, description }) => {
  const [visible, setVisible] = useState<boolean>(true);

  return createPortal(
    <AnimatePresence>
      {visible && (
        <Container animate={{ height: 'auto' }} exit={{ opacity: '0' }} initial={{ height: 0 }}>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <CloseIcon onClick={() => setVisible(false)} size={18} />
        </Container>
      )}
    </AnimatePresence>,
    document.querySelector('#notification-banner') as Element
  );
};
