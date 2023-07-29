import { FC, PropsWithChildren, useContext } from 'react';
import { styled } from '../../../../styled';
import { SelectContext } from './context';
import { AiOutlineCheck as CheckIcon } from 'react-icons/ai';

const OptionContainer = styled.div<{ isSelected: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
  min-height: ${({ theme }) => theme.spacing[4]};
  cursor: default;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.15s ease-out;
  outline: 0;
  scroll-margin: ${({ theme }) => theme.spacing['0_75']};

  &:focus {
    background-color: ${({ theme }) => theme.colors.primary};
    color: rgba(255, 255, 255, 0.9);
    position: relative;
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
    gap: ${({ theme }) => theme.spacing[1]};

    span {
      color: ${({ theme, isSelected }) => (isSelected ? theme.colors.white : theme.colors.text)};
    }
  }
`;

const StyledCheckIcon = styled(CheckIcon)`
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

export interface OptionProps extends PropsWithChildren {
  value: string;
  index?: number;
  onChange?: (value: string) => unknown;
}

export const Option: FC<OptionProps> = ({ children, index = 0, value, onChange }) => {
  const { selectedIndex, setSelectedIndex, listRef, setOpen, activeIndex, setActiveIndex, getItemProps, dataRef } =
    useContext(SelectContext);

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
      <span>{children}</span> {selectedIndex === index && <StyledCheckIcon size={15} />}
    </OptionContainer>
  );
};
