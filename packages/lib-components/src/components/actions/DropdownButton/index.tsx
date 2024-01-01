import { FC, useState, useEffect, ReactElement, useRef } from 'react';
import { useOutsideAlerter } from '../../../hooks';
import { MdChevronRight as ArrowIcon } from 'react-icons/md';
import { ActionMenu } from '../../../components';
import { styled } from '../../../styled';
import { useFloating } from '@floating-ui/react';

const Arrow = styled(ArrowIcon)`
  transform: rotate(90deg);
  fill: ${({ theme }) => theme.colors.secondary};
`;

const Wrapper = styled.div``;

const DropdownActionContainer = styled.div<{ isVisible: boolean }>`
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing['0_5']} 0`};
  justify-content: center;
  cursor: pointer;
  width: 3.2rem;
  border: .1rem solid ${({ theme, isVisible }) => (isVisible ? theme.colors.primary : theme.colors.backgroundAccent)}};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.small}};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.small}};
  

  &:hover {
    border-color:${({ theme }) => theme.colors.primary};
    svg {
      fill: ${({ theme }) => theme.colors.primary};
    }
  }
  &:active {
    background-color: transparent;
  }
`;

const CurrentAction = styled.div`
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
  font-weight: 500;
  cursor: pointer;
  min-width: 10rem;
  height: 100%;
  color: ${({ theme }) => theme.colors.text};
  border-top: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  border-left: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  border-bottom: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.small};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.small};

  text-align: center;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
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

  &:hover ${DropdownActionContainer} {
    border-left-color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface DropdownButtonProps {
  children: ReactElement[];
}

export const DropdownButton: FC<DropdownButtonProps> = ({ children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(0);
  const { x, y, refs, strategy } = useFloating();

  const parentRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(parentRef, () => {
    setVisible(false);
  });

  useEffect(() => {
    setVisible(false);
  }, [selected]);

  const handleSelectedActionClicked = () => {
    setVisible(false);
    children[selected].props.onClick();
  };

  return (
    <Wrapper ref={parentRef}>
      <Container ref={refs.setReference}>
        <CurrentAction onClick={handleSelectedActionClicked}>{children[selected].props.text}</CurrentAction>
        <DropdownActionContainer onClick={() => setVisible(!visible)} isVisible={visible}>
          <Arrow size={20} />
        </DropdownActionContainer>
        {visible && (
          <ActionMenu selectedState={[selected, setSelected]} attributes={{ x, y, strategy }} ref={refs.setFloating}>
            {children}
          </ActionMenu>
        )}
      </Container>
    </Wrapper>
  );
};
