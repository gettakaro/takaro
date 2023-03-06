import {
  cloneElement,
  FC,
  Children,
  ReactNode,
  useState,
  isValidElement,
  FunctionComponentElement,
  ReactElement,
  useEffect,
} from 'react';
import { styled } from '../../../styled';
import { ToggleButtonProps } from './ToggleButton';

type orientation = 'horizontal' | 'vertical';

const Container = styled.div<{ orientation: orientation; fullWidth: boolean }>`
  display: flex;
  flex-direction: ${({ orientation }) =>
    orientation === 'horizontal' ? 'row' : 'column'};
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'max-content')};

  button {
    flex-basis: ${({ fullWidth }) => (fullWidth ? '100%' : '')};
    border: 2px solid ${({ theme }): string => theme.colors.gray};
    border-bottom: ${({ orientation, theme }) =>
      orientation === 'horizontal' ? `2px solid ${theme.colors.gray}` : 'none'};
    border-right: ${({ orientation, theme }) =>
      orientation === 'vertical' ? `2px solid ${theme.colors.gray}` : 'none'};

    &:first-child {
      ${({ orientation }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
          `;
        } else {
          return `
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
          `;
        }
      }}
    }

    &:last-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
            border-right: 2px solid ${theme.colors.gray};
          `;
        } else {
          return `
            border-bottom-right-radius: 5px;
            border-bottom-left-radius: 5px;
            border-bottom: 2px solid ${theme.colors.gray};
      `;
        }
      }}
    }
  }
`;

export interface ToggleButtonGroupProps {
  onChange?: (value: string | Map<string, boolean>) => unknown;
  orientation?: orientation;
  /// if `true` only allow one of the child ToggleButton values to be selected.
  exclusive?: boolean;
  children: ReactNode | FunctionComponentElement<ToggleButtonProps>;
  /// The currently selected value within the group or an array of selected values when `exclusive` is false
  defaultValue?: string;
  fullWidth?: boolean;
}

export const ToggleButtonGroup: FC<ToggleButtonGroupProps> = ({
  children,
  defaultValue,
  exclusive,
  onChange = () => {},
  orientation = 'horizontal',
  fullWidth = false,
}) => {
  /* TODO: set correct type
   * if true: string
   * if false: Map<string, boolean>
   */
  const [selected, setSelected] = useState<any>(
    exclusive ? defaultValue || '' : handleDefaultValueNonExclusive()
  );

  function handleDefaultValueNonExclusive() {
    const m = new Map();
    selected as Map<string, boolean>;

    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        m.set(child.props.value, false);
      }
    });
    return m;
  }

  const clickEvent = (value: string) => {
    if (exclusive) {
      // handle exclusive (one value return)
      if (selected === value) {
        return setSelected('');
      }
      return setSelected(value);
    } else {
      // handle case that each button has a seperate state
      setSelected(new Map(selected.set(value, !selected.get(value))));
    }
  };

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <Container orientation={orientation} fullWidth={fullWidth}>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(
            child as ReactElement<ToggleButtonProps | Record<string, unknown>>,
            {
              selected: exclusive
                ? selected == child.props.value
                : selected.get(child.props.value),
              parentClickEvent: clickEvent,
              orientation: orientation,
            }
          );
        }
        return child;
      })}
    </Container>
  );
};
