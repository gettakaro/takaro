import { FC, PropsWithChildren, useContext } from 'react';
import { styled } from '../../../../styled';
import { SearchFieldContext } from './context';
import { AiOutlineCheck as CheckIcon } from 'react-icons/ai';

// uses the same styling as the Select component
import { OptionContainer } from '../../Select/style';

const StyledCheckIcon = styled(CheckIcon)`
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

interface OptionProps extends PropsWithChildren {
  value: string;
  label: string;
  // This value is set by the SearchField component
  index?: number;
}

export const Option: FC<OptionProps> = ({ children, index = 0, value, label }) => {
  const { getItemProps, setOpen, listRef, setInputValue, activeIndex, setActiveIndex, inputValue } =
    useContext(SearchFieldContext);

  const handleClick = () => {
    setInputValue({ value, shouldUpdate: false, label });
    // TODO: send back value
    setOpen(false);
    setActiveIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setInputValue({ value, shouldUpdate: false, label });
      setOpen(false);
    }

    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  return (
    <OptionContainer
      ref={(node: any) => (listRef.current[index] = node)}
      tabIndex={activeIndex === index ? 0 : 1}
      isMultiSelect={false}
      aria-selected={activeIndex === index}
      {...getItemProps({
        role: 'option',
        onClick: handleClick,
        onKeyDown: handleKeyDown,
      })}
      isActive={activeIndex === index}
    >
      <span>{children} </span>
      {value === inputValue.value && <StyledCheckIcon size={15} />}
    </OptionContainer>
  );
};
