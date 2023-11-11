import { FC, PropsWithChildren, useContext } from 'react';
import { styled } from '../../../../styled';
import { SelectContext } from './context';
import { AiOutlineCheck as CheckIcon } from 'react-icons/ai';
import { OptionContainer } from '../style';
import { GenericCheckBox } from '../../CheckBox';

const StyledCheckIcon = styled(CheckIcon)`
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

export interface OptionProps extends PropsWithChildren {
  value: string;

  // Properties set by the Select component
  index?: number;
  onChange?: (value: string | string[]) => unknown;
}

// check if the index is already selected, if so remove it, otherwise add it.
function toggleSelectedIndex(selectedIndices: number[], index: number) {
  if (selectedIndices.includes(index)) {
    return selectedIndices.filter((i) => i !== index);
  } else {
    return [...selectedIndices, index];
  }
}

// get the values from the selected indices
function getselectedValues(selectedIndices: number[], options: string[]): string[] {
  return selectedIndices.map((i) => options[i]);
}

export const Option: FC<OptionProps> = ({ children, index = 0, value, onChange }) => {
  const {
    selectedIndex,
    setSelectedIndex,
    listRef,
    setOpen,
    activeIndex,
    setActiveIndex,
    getItemProps,
    dataRef,
    multiSelect,
    values,
    name,
  } = useContext(SelectContext);

  function handleSelect() {
    if (multiSelect) {
      toggleSelectedIndex(selectedIndex as number[], index);
      if (onChange) onChange(getselectedValues(selectedIndex as number[], values));
    } else {
      setSelectedIndex(index);
      if (onChange) onChange(value);
      setOpen(false);
    }
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
      {multiSelect && (
        <GenericCheckBox
          size="tiny"
          id={`${name}-checkbox-${index}`}
          hasDescription={false}
          hasError={false}
          onChange={() => {
            /* bubbles up? */
          }}
          name={`${name}-checkbox-${index}`}
          value={(selectedIndex as number[]).includes(index)}
        />
      )}
      <span>{children}</span> {!multiSelect && selectedIndex === index && <StyledCheckIcon size={15} />}
    </OptionContainer>
  );
};
