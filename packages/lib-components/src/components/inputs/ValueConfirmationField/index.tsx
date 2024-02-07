import { ChangeEvent, FC, useState } from 'react';
import { InputWrapper, Label, UnControlledTextField } from '../../../components';

export interface ValueConfirmationFieldProps {
  /// Callback to notify the parent component if the value is correct
  onValidChange: (valid: boolean) => void;
  /// The value you need to type
  value: string;
  label?: string;
  id: string;
  disabled?: boolean;
}

export const ValueConfirmationField: FC<ValueConfirmationFieldProps> = ({
  value,
  onValidChange,
  id,
  label = 'Confirmation',
  disabled = false,
}) => {
  const [innerValue, setInnerValue] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInnerValue(e.target.value);

    if (e.target.value === value && isValid === false) {
      setIsValid(true);
      onValidChange(true);
    } else {
      setIsValid(false);
      onValidChange(false);
    }
  };

  return (
    <InputWrapper>
      <Label htmlFor={id} text={label} required disabled={disabled} size="tiny" error={false} position="top" />
      <UnControlledTextField
        type="text"
        value={innerValue}
        id={id}
        disabled={false}
        readOnly={false}
        hasError={true}
        hasDescription={false}
        name="deleteConfirmation"
        placeholder={value}
        required
        onChange={handleOnChange}
      />
    </InputWrapper>
  );
};
