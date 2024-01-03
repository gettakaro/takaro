import { FC, PropsWithChildren, useContext } from 'react';
import { styled } from '../../../../styled';
import { AiOutlineCheck as CheckIcon } from 'react-icons/ai';
import { GenericCheckBox } from '../../CheckBox';
import { OptionContainer } from './style';
import { SelectContext, SelectItem } from '..';

const StyledCheckIcon = styled(CheckIcon)`
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

interface OptionProps extends PropsWithChildren {
  value: string;
  label: string;
  disabled?: boolean;
  // These values are controlled by the SearchField component
  index?: number;
  onChange?: (values: string | string[]) => unknown;
}

// check if the index is already selected, if so remove it, otherwise add it.
function toggleSelectedItem(selectedValues: SelectItem[], itemToToggle: SelectItem) {
  // Check if the value already exists in the selectedValues
  const existingIndex = selectedValues.findIndex((item) => item.value === itemToToggle.value);

  if (existingIndex > -1) {
    // If it exists, remove it from the array
    return selectedValues.filter((_, index) => index !== existingIndex);
  } else {
    // If it doesn't exist, add it to the array
    return [...selectedValues, itemToToggle];
  }
}

function hasSelectedItem(selectedItems: SelectItem[], itemToCheck: SelectItem) {
  return selectedItems.some((item) => item.value === itemToCheck.value);
}

export const Option: FC<OptionProps> = ({ children, index = 0, value, onChange, disabled = false, label }) => {
  const { getItemProps, selectedItems, setSelectedItems, setOpen, listRef, activeIndex, dataRef, name, multiSelect } =
    useContext(SelectContext);

  const handleSelect = () => {
    // array of values
    if (multiSelect) {
      const updatedItems = toggleSelectedItem(selectedItems, { value, label });
      setSelectedItems(updatedItems);
      if (onChange) onChange(updatedItems.map((item) => item.value));
    } else {
      // single value
      setSelectedItems([{ value, label }]);
      if (onChange) onChange(value);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }

    // Prevent the spacebar from scrolling the page
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
      aria-disabled={disabled}
      isGrouped={false}
      aria-selected={activeIndex === index}
      {...getItemProps({
        role: 'option',
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
          value={hasSelectedItem(selectedItems, { value, label })}
        />
      )}
      <span style={{ marginLeft: multiSelect ? '10px' : 0 }}>{children}</span>{' '}
      {!multiSelect && selectedItems.includes({ value, label }) && <StyledCheckIcon />}
    </OptionContainer>
  );
};
