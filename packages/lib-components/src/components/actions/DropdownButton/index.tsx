import { useState, useEffect, useRef, forwardRef, Children, PropsWithChildren } from 'react';
import { useOutsideAlerter } from '../../../hooks';
import { MdChevronRight as ArrowIcon } from 'react-icons/md';
import { ActionMenu } from '../../../components';
import { styled } from '../../../styled';
import { useFloating, useMergeRefs } from '@floating-ui/react';
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
  width: calc(100% - 3.2rem);
  white-space: nowrap;

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

const Container = styled.div<{ fullWidth: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'max-content')};
`;

export interface DropdownButtonProps extends PropsWithChildren {
  color?: ButtonColor;
  onSelectedChanged?: (index: number) => void;
  fullWidth?: boolean;
}

export const DropdownButton = forwardRef<HTMLDivElement, DropdownButtonProps>(function Dropdown(
  { children, color = 'primary', onSelectedChanged, fullWidth = false },
  propRef,
) {
  const [listVisible, setListVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(0);
  const { x, y, refs, strategy } = useFloating();

  const parentRef = useRef<HTMLDivElement>(null);
  const ref = useMergeRefs([propRef, parentRef]);

  useOutsideAlerter(parentRef, () => {
    setListVisible(false);
  });

  useEffect(() => {
    if (onSelectedChanged) {
      onSelectedChanged(selected);
    }
    setListVisible(false);
  }, [selected]);

  const handleSelectedActionClicked = () => {
    setListVisible(false);

    // @ts-expect-error: selected could be undefined
    Children.toArray(children).at(selected)?.props.onClick();
  };

  // TODO: this element does not handle the case where there are no children/actions

  return (
    <Wrapper ref={ref}>
      <Container ref={refs.setReference} fullWidth={fullWidth}>
        <CurrentAction color={color} onClick={handleSelectedActionClicked} role="button">
          {/* @ts-expect-error: selected could be undefined */}
          {children[selected].props.text}
        </CurrentAction>
        <DropdownActionContainer role="button" color={color} onClick={() => setListVisible(!listVisible)}>
          <Arrow size={20} />
        </DropdownActionContainer>
        {listVisible && (
          <ActionMenu
            selected={selected}
            setSelected={(s) => setSelected(s)}
            attributes={{ x, y, strategy }}
            ref={refs.setFloating}
          >
            {/* @ts-expect-error: children cannot be undefined in this case */}
            {children}
          </ActionMenu>
        )}
      </Container>
    </Wrapper>
  );
});
