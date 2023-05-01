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
    border: 0.1rem solid ${({ theme }): string => theme.colors.backgroundAlt};
    border-bottom: ${({ orientation, theme }) =>
      orientation === 'horizontal'
        ? `0.1rem solid ${theme.colors.backgroundAlt}`
        : 'none'};
    border-right: ${({ orientation, theme }) =>
      orientation === 'vertical'
        ? `0.1rem solid ${theme.colors.backgroundAlt}`
        : 'none'};

    &:first-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-left-radius: ${theme.borderRadius.medium};
            border-bottom-left-radius: ${theme.borderRadius.medium};
          `;
        } else {
          return `
        border-top-left-radius: ${theme.borderRadius.medium};
        border-top-right-radius: ${theme.borderRadius.medium};
          `;
        }
      }}
    }

    &:last-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-right-radius: ${theme.borderRadius.medium};
            border-bottom-right-radius: ${theme.borderRadius.medium};
            border-right: 0.1rem solid ${theme.colors.backgroundAlt};
          `;
        } else {
          return `
            border-bottom-right-radius: ${theme.borderRadius.medium};
            border-bottom-left-radius: ${theme.borderRadius.medium};
            border-bottom: 0.1rem solid ${theme.colors.backgroundAlt};
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
  const [selected, setSelected] = useState<string | Map<string, boolean>>(
    exclusive ? defaultValue || '' : handleDefaultValueNonExclusive()
  );

  function handleDefaultValueNonExclusive() {
    const m = new Map<string, boolean>();
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
      setSelected(
        new Map(
          (selected as Map<string, boolean>).set(
            value,
            !(selected as Map<string, boolean>).get(value)
          )
        )
      );
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
                : (selected as Map<string, boolean>).get(child.props.value),
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
