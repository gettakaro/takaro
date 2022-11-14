import { FC, PropsWithChildren, useContext } from 'react';
import { styled } from '../../../styled';
import { SelectContext } from './context';
import { AiOutlineCheck as CheckIcon } from 'react-icons/ai';

const OptionContainer = styled.div<{ isSelected: boolean }>`
  padding: 6px 16px;
  min-height: 35px;
  cursor: default;
  border-radius: 4px;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.15s ease-out;
  outline: 0;
  scroll-margin: 8px;

  &:focus {
    background-color: ${({ theme }) => theme.colors.primary};
    color: rgba(255, 255, 255, 0.9);
    box-shadow: ${({ theme }) => theme.shadows.default};
    position: relative;
    z-index: 1;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    span {
      color: white;
    }
  }

  & > div {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      color: ${({ theme, isSelected }) =>
        isSelected ? theme.colors.white : theme.colors.text};
    }
  }
`;

export interface OptionProps extends PropsWithChildren {
  value: string;
  index?: number;
  onChange?: (value: string) => unknown;
}

export const Option: FC<OptionProps> = ({
  children,
  index = 0,
  value,
  onChange,
}) => {
  const {
    selectedIndex,
    setSelectedIndex,
    listRef,
    setOpen,
    activeIndex,
    setActiveIndex,
    getItemProps,
    dataRef,
  } = useContext(SelectContext);

  function handleSelect() {
    setSelectedIndex(index);
    if (onChange) onChange(value);

    setOpen(false);
    setActiveIndex(null);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect();
    }

    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && !dataRef.current.typing) {
      handleSelect();
    }
  };

  return (
    <OptionContainer
      role="option"
      ref={(node: any) => (listRef.current[index] = node)}
      tabIndex={activeIndex === index ? 0 : 1}
      isSelected={activeIndex === index}
      aria-selected={activeIndex === index}
      data-selected={selectedIndex === index}
      {...getItemProps({
        onClick: handleSelect,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp,
      })}
    >
      {children} {selectedIndex === index && <CheckIcon />}
    </OptionContainer>
  );
};
