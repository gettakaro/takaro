import { useEffect, useState, forwardRef } from 'react';
import { getTransition } from '../../../helpers';
import { Dot, Line, ContentContainer } from './style';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  GenericInputPropsFunctionHandlers,
} from '../InputProps';
import { setAriaDescribedBy } from '../layout';

export type GenericSwitchProps = GenericInputPropsFunctionHandlers<
  boolean,
  HTMLDivElement
>;

const defaultsApplier =
  defaultInputPropsFactory<GenericSwitchProps>(defaultInputProps);

export const GenericSwitch = forwardRef<HTMLDivElement, GenericSwitchProps>(
  (props, ref) => {
    const { readOnly, onChange, value, id, hasDescription, name } =
      defaultsApplier(props);

    const [isChecked, setChecked] = useState<boolean>(value as boolean);

    function handleOnClick(): void {
      setChecked(!isChecked);
    }

    useEffect(() => {
      onChange(isChecked);
    }, [isChecked]);

    return (
      <ContentContainer
        onClick={handleOnClick}
        ref={ref}
        id={id}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
      >
        <Line readOnly={readOnly} isChecked={isChecked}>
          <Dot
            animate={{ right: isChecked ? '-2px' : '15px' }}
            readOnly={readOnly}
            isChecked={isChecked}
            layout
            transition={getTransition()}
          />
        </Line>
      </ContentContainer>
    );
  }
);
