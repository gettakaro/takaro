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

  // This is required for filtering
  label?: string;
  // Properties set by the Select component
  index?: number;
  onChange?: (value: string | string[]) => unknown;

  disabled?: boolean;
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

export const Option: FC<OptionProps> = ({ children, index = 0, value, onChange, disabled }) => {
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
      // Since state updates are async, we cannot use the selectedIndex state in the onChange callback
      const updatedIndices = toggleSelectedIndex(selectedIndex as number[], index);
      setSelectedIndex(updatedIndices);
      if (onChange) onChange(getselectedValues(updatedIndices, values));
    } else {
      setSelectedIndex(index);
      if (onChange) onChange(value);
      setOpen(false);
    }

    // Reset the active index
    setActiveIndex(null);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // select the option on enter
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect();
    }

    // prevent the page from scrolling when using the spacebar
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    // select the option on spacebar
    if (e.key === ' ' && !dataRef.current.typing) {
      handleSelect();
    }
  };

  return (
    <OptionContainer
      role="option"
      ref={(node: any) => (listRef.current[index] = node)}
      tabIndex={activeIndex === index ? 0 : 1}
      isMultiSelect={multiSelect}
      isActive={activeIndex === index}
      // Selected in this case means the one we are hovering
      aria-selected={activeIndex === index}
      aria-disabled={disabled}
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
            /* bubbles up tot he optionContainer which handles the selection */
          }}
          name={`${name}-checkbox-${index}`}
          value={(selectedIndex as number[]).includes(index)}
        />
      )}
      <span style={{ marginLeft: multiSelect ? '10px' : 0 }}>{children}</span>{' '}
      {!multiSelect && selectedIndex === index && <StyledCheckIcon size={15} />}
    </OptionContainer>
  );
};
