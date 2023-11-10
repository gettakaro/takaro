import { FC, PropsWithChildren, useContext } from 'react';
import { styled } from '../../../../styled';
import { SelectContext } from './context';
import { AiOutlineCheck as CheckIcon } from 'react-icons/ai';
import { OptionContainer } from '../style';

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
      isActive={activeIndex === index}
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
