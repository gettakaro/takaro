import { FC, useState, useEffect, ReactElement, useRef } from 'react';
import { useOutsideAlerter } from '../../../hooks';
import { MdChevronRight as ArrowIcon } from 'react-icons/md';
import { ActionMenu } from '../../../components';
import { styled } from '../../../styled';
import { useFloating } from '@floating-ui/react';
import { shade } from 'polished';
import { ButtonColor } from '../Button/style';

const Arrow = styled(ArrowIcon)`
  transform: rotate(90deg);
  fill: ${({ theme }) => theme.colors.secondary};
`;

const Wrapper = styled.div``;

const DropdownActionContainer = styled.div<{ color: ButtonColor }>`
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing['0_5']} 0`};
  justify-content: center;
  cursor: pointer;
  width: 3.2rem;

  background: ${({ theme, color }) => shade(0.5, theme.colors[color])};
  border: .1rem solid ${({ theme, color }) => theme.colors[color === 'background' ? 'backgroundAccent' : color]}};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.small}};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.small}};

  svg {
    fill: ${({ theme }) => theme.colors.text};
  }
  &:active {
    background-color: transparent;
  }
`;

const CurrentAction = styled.div<{ color: ButtonColor }>`
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
  font-weight: 500;
  cursor: pointer;
  min-width: 10rem;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};

  background: ${({ theme, color }) => shade(0.5, theme.colors[color])};
  border-top: 0.1rem solid ${({ theme, color }) => theme.colors[color === 'background' ? 'backgroundAccent' : color]};
  border-left: 0.1rem solid ${({ theme, color }) => theme.colors[color === 'background' ? 'backgroundAccent' : color]};
  border-bottom: 0.1rem solid ${({ theme, color }) => theme.colors[color === 'background' ? 'backgroundAccent' : color]};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.small};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.small};

  text-align: center;
  &:active {
    background-color: transparent;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: max-content;
`;

export interface DropdownButtonProps {
  children: ReactElement[];
  color?: ButtonColor;
}

export const DropdownButton: FC<DropdownButtonProps> = ({ children, color = 'primary' }) => {
  const [listVisible, setListVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(0);
  const { x, y, refs, strategy } = useFloating();

  const parentRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(parentRef, () => {
    setListVisible(false);
  });

  useEffect(() => {
    setListVisible(false);
  }, [selected]);

  const handleSelectedActionClicked = () => {
    setListVisible(false);
    children[selected].props.onClick();
  };

  return (
    <Wrapper ref={parentRef}>
      <Container ref={refs.setReference}>
        <CurrentAction color={color} onClick={handleSelectedActionClicked}>
          {children[selected].props.text}
        </CurrentAction>
        <DropdownActionContainer color={color} onClick={() => setListVisible(!listVisible)}>
          <Arrow size={20} />
        </DropdownActionContainer>
        {listVisible && (
          <ActionMenu selectedState={[selected, setSelected]} attributes={{ x, y, strategy }} ref={refs.setFloating}>
            {children}
          </ActionMenu>
        )}
      </Container>
    </Wrapper>
  );
};
