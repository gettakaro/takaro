import { getTransition } from '../../../helpers';
import { forwardRef, useRef } from 'react';
import { useRadioGroupContext } from './context';
import { styled } from '../../../styled';
import { motion } from 'framer-motion';

const RadioItemContainer = styled.div<{ readOnly: boolean; isChecked: boolean }>`
  display: grid;
  place-items: center;
  min-width: ${({ theme }) => theme.spacing['2_5']};
  min-height: ${({ theme }) => theme.spacing['2_5']};
  width: ${({ theme }) => theme.spacing['2_5']};
  height: ${({ theme }) => theme.spacing['2_5']};
  max-width: ${({ theme }) => theme.spacing['2_5']};
  max-height: ${({ theme }) => theme.spacing['2_5']};
  align-items: center;
  justify-content: center;
  border: 0.1rem solid
    ${({ theme, readOnly, isChecked }): string => {
      if (readOnly) return theme.colors.backgroundAccent;
      if (isChecked) return theme.colors.primary;
      return theme.colors.backgroundAccent;
    }};

  background-color: ${({ theme, readOnly }) => (readOnly ? theme.colors.backgroundAccent : theme.colors.background)};
  border-radius: 100%;
  cursor: ${({ readOnly }) => (readOnly ? 'normal' : 'pointer')};
  overflow: visible;

  &.placeholder {
    border: none;
    border-radius: 50%;
    width: 2.2rem; /* 2.1rem + 1px shadow */
    height: 2.2rem;
    cursor: default;
  }
`;

const Inner = styled(motion.div)<{ isChecked: boolean; readOnly: boolean }>`
  width: ${({ theme }) => theme.spacing['1_5']};
  height: ${({ theme }) => theme.spacing['1_5']};
  border-radius: 100%;
  background-color: ${({ theme, readOnly }) => {
    if (readOnly) return theme.colors.backgroundAlt;
    return theme.colors.primary;
  }};
  opacity: ${({ isChecked }): number => (isChecked ? 1 : 0)};
  transition: 0.1s opacity linear cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export interface RadioItemProps {
  value: string;
  id: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const variants = {
  selected: { scale: 1 },
  deselected: { scale: 0 },
};

export const RadioItem = forwardRef<HTMLDivElement, RadioItemProps>(
  ({ readOnly = false, disabled = false, value }, ref) => {
    const { setSelectedValue, selectedValue, name } = useRadioGroupContext();
    const checked = selectedValue === value;
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOnClick = () => {
      if (readOnly || disabled) return;
      inputRef.current?.click();
    };

    return (
      <>
        <input
          id={value}
          name={name}
          type="radio"
          style={{ position: 'absolute', opacity: 0, margin: 0, padding: 0, pointerEvents: 'none' }}
          aria-hidden="true"
          value={value}
          tabIndex={-1}
          checked={checked}
          onChange={(e) => setSelectedValue(e)}
          ref={inputRef}
        />
        <RadioItemContainer
          isChecked={checked}
          readOnly={readOnly}
          onClick={handleOnClick}
          tabIndex={disabled ? -1 : 0}
          role="radio"
          ref={ref}
        >
          <Inner
            initial={checked ? 'selected' : 'deselected'}
            animate={checked ? 'selected' : 'deselected'}
            isChecked={checked}
            readOnly={readOnly}
            transition={getTransition()}
            variants={variants}
          />
        </RadioItemContainer>
      </>
    );
  }
);
