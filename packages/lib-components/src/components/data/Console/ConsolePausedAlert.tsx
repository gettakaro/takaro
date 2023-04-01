import { FC, useState } from 'react';
import { GiPauseButton } from 'react-icons/gi';
import { ImArrowDown2 } from 'react-icons/im';
import { styled } from '../../../styled';

const Container = styled.div`
  position: absolute;
  display: inline-flex;
  justify-content: center;
  cursor: pointer;
  inset-x: 0;
  bottom: 28px;
  margin-left: auto;
  margin-right: auto;

  span {
    display: inline-flex;
    align-items: center;
  }
`;

interface ConsolePausedAlertProps {
  onClick: () => void;
}

export const ConsolePausedAlert: FC<ConsolePausedAlertProps> = ({
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <Container
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {isHovered ? (
        <span>
          <ImArrowDown2 />
          See new messages
        </span>
      ) : (
        <span>
          <GiPauseButton />
          Chat paused due to scroll
        </span>
      )}
    </Container>
  );
};
