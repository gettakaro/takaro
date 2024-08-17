import { FC, PropsWithChildren } from 'react';
import { useController } from 'react-hook-form';
import { ControlledInputProps, defaultInputProps, defaultInputPropsFactory } from '../InputProps';

import { Container } from './style';
import { RadioItem } from './RadioItem';
import { InputWrapper, ErrorMessage, Description } from '../layout';
import { GenericRadioGroup, RadioGroupSubComponents } from './Generic';

export type ControlledRadioGroupProps = PropsWithChildren<ControlledInputProps>;

const defaultsApplier = defaultInputPropsFactory<ControlledRadioGroupProps>(defaultInputProps);

export const ControlledRadioGroup: FC<ControlledRadioGroupProps> & RadioGroupSubComponents = (props) => {
  const { name, control, description, children, disabled, readOnly, required } = defaultsApplier(props);

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <InputWrapper>
      <Container>
        <GenericRadioGroup
          id={name}
          name={name}
          onChange={field.onChange}
          value={field.value}
          disabled={disabled}
          readOnly={readOnly}
          hasError={!!error}
          required={required}
          hasDescription={!!description}
        >
          {children}
        </GenericRadioGroup>
        {error && error.message && <ErrorMessage message={error.message} />}
      </Container>
      {description && <Description description={description} inputName={name} />}
    </InputWrapper>
  );
};

ControlledRadioGroup.Item = RadioItem;
