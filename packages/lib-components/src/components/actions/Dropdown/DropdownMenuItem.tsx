import { useListItem } from '@floating-ui/react';
import { cloneElement, FC, ReactElement, MouseEvent } from 'react';
import { useDropdownContext } from './DropdownContext';
import { styled } from '../../../styled';
import { AiOutlineClose as UndoIcon, AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { GenericCheckBox } from '../../../components/inputs/CheckBox/Generic';
import { IconBaseProps } from 'react-icons/lib';

const Container = styled(motion.button)<{ isActive: boolean }>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.background)};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['0_75']}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  span {
    margin-left: ${({ theme }) => theme.spacing['0_75']};
  }

  &:disabled {
    span {
      color: ${({ theme }) => theme.colors.textAlt};
    }
    svg {
      fill: ${({ theme }) => theme.colors.textAlt};
      stroke: ${({ theme }) => theme.colors.textAlt};
    }
    cursor: not-allowed;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export interface DropdownMenuItemProps {
  label: string;
  disabled?: boolean;
  icon?: ReactElement<IconBaseProps>;
  iconPosition?: 'left' | 'right';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  activeStyle?: 'checkbox' | 'undo' | 'checkmark';
}

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  label,
  disabled,
  onClick,
  iconPosition = 'left',
  activeStyle = 'undo',
  active = false,
  icon,
}) => {
  const { activeIndex, setOpen, getItemProps } = useDropdownContext();
  const { ref, index } = useListItem();

  const isActive = activeIndex === index;

  const getIcon = () => {
    if (icon) return cloneElement(icon, { size: 17 });
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick(e);

    if (activeStyle === 'undo') {
      setOpen(false);
    }
  };

  const handleMouseUp = () => {
    if (activeStyle === 'undo') {
      setOpen(false);
    }
  };

  return (
    <Container
      type="button"
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      isActive={isActive}
      ref={ref}
      tabIndex={disabled ? -1 : 0}
      role="menuitem"
      disabled={disabled}
      {...getItemProps({
        onClick: handleClick,
        onMouseUp: handleMouseUp,
      })}
    >
      {activeStyle === 'checkbox' && (
        <GenericCheckBox
          onChange={(e) => {
            e.stopPropagation();
          }}
          value={active}
          hasDescription={false}
          size="tiny"
          hasError={false}
          name={`menu-item-checkbox-${label}`}
          disabled={false}
          readOnly
          id={`menu-item-checkbox-${label}`}
        />
      )}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: iconPosition === 'left' ? 'flex-start' : 'space-between',
        }}
      >
        {icon && iconPosition === 'left' && getIcon()}
        <span>{label}</span>
        {icon && iconPosition === 'right' && getIcon()}
      </div>
      {active && activeStyle === 'undo' && <UndoIcon style={{ marginLeft: '10px' }} size={16} />}
      {active && activeStyle === 'checkmark' && <CheckmarkIcon style={{ marginLeft: '10px' }} size={16} />}
    </Container>
  );
};
