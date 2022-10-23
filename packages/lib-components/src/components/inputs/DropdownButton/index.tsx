import { ActionMenu } from '../../../components';
import { FC, useState, useEffect, createRef, ReactElement } from 'react';
import { useOutsideAlerter } from '../../../hooks';
import { MdChevronRight as ArrowIcon } from 'react-icons/md';
import { styled } from '../../../styled';
import { useFloating } from '@floating-ui/react-dom';
import { lighten } from 'polished';

const Arrow = styled(ArrowIcon)`
  transform: rotate(90deg);
  fill: ${({ theme }) => theme.colors.secondary};
`;

const Wrapper = styled.div``;

const DropdownActionContainer = styled.div<{ isVisible: boolean }>`
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: .5rem 0;
  justify-content: center;
  cursor: pointer;
  width: 3.2rem;
  border: .2rem solid ${({ theme, isVisible }) => isVisible ? theme.colors.primary : theme.colors.gray}};
  border-top-right-radius: .5rem;
  border-bottom-right-radius: .5rem;

  &:hover {
    border-color:${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => lighten(0.3, theme.colors.primary)};
    svg {
      fill: ${({ theme }) => theme.colors.primary};
    }
  }
  &:active {
    background-color: transparent;
  }
`;

const CurrentAction = styled.div`
  padding: .5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 10rem;
  color: ${({ theme }) => theme.colors.text};
  border-top: .2rem solid ${({ theme }) => theme.colors.gray};
  border-left: .2rem solid ${({ theme }) => theme.colors.gray};
  border-bottom: .2rem solid ${({ theme }) => theme.colors.gray};
  border-top-left-radius: .5rem;
  border-bottom-left-radius: .5rem;
  text-align: center;
  &:hover {
    color:${({ theme }) => theme.colors.primary};
    border-color:${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => lighten(0.3, theme.colors.primary)};
  }
  &:active {
    background-color: transparent;
  }
`;

const Container = styled.div`
  display: flex; 
  align-items: center;
  border-radius: .8rem;
  width: max-content;

  &:hover ${DropdownActionContainer} {
    border-left-color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface DropdownButtonProps {
  children: ReactElement[];
};

export const DropdownButton: FC<DropdownButtonProps> = ({ children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(0);
  const { x, y, reference, floating, strategy } = useFloating();

  const parentRef = createRef<HTMLDivElement>();
  useOutsideAlerter(parentRef, () => {
    setVisible(false);
  });

  useEffect(() => {
    setVisible(false);
  }, [selected]);

  return (
    <Wrapper ref={parentRef}>
      <Container ref={reference}>
        <CurrentAction onClick={() => children[selected].props.onClick}>{children[selected].props.text}</CurrentAction>
        <DropdownActionContainer onClick={() => setVisible(!visible)} isVisible={visible}><Arrow size={17} /></DropdownActionContainer>
        {visible && <ActionMenu
          selectedState={[selected, setSelected]}
          attributes={{ x, y, strategy }}
          ref={floating}
        >
          {children}
        </ActionMenu>
        }
      </Container>
    </Wrapper>
  );
};

