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
import { Container } from './style';
import { ToggleButtonProps } from './ToggleButton';

export type orientation = 'horizontal' | 'vertical';

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
