import {
  FC,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useController } from 'react-hook-form';
import { ErrorMessage } from '../ErrorMessage';

import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';
import { Label } from '../Label';

import { Container } from './style';

export interface EditableFieldProps extends InputProps {
  isEditing?: boolean;
}

const defaultsApplier = defaultInputPropsFactory<EditableFieldProps>({
  ...defaultInputProps,
  required: true,
});

export const EditableField: FC<EditableFieldProps> = (props) => {
  const {
    isEditing = false,
    disabled,
    required,
    value,
    label,
    size,
    hint,
    error,
    name,
    control,
    loading,
  } = defaultsApplier(props);

  const [editing, setEditing] = useState(isEditing);
  const inputRef = useRef<HTMLInputElement>(null);

  const { field } = useController({ name, control, defaultValue: value });

  useEffect(() => {
    if (inputRef && inputRef.current && editing === true) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, inputRef]);

  useEffect(() => {
    setEditing(editing);
  }, [editing]);

  // handle focus change
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    const keys = ['Escape', 'Tab', 'Enter'];

    if (required && inputRef.current?.value == '') {
      return;
    }

    if (keys.indexOf(key) > -1 && inputRef.current && !disabled) {
      setEditing(false);
    }
  };

  const handleOnBlur = () => {
    if (required && inputRef.current?.value == '') {
      return;
    }
    setEditing(false);
  };

  const handleOnClick = ({ detail }: MouseEvent<HTMLDivElement>) => {
    // double click
    if (detail == 2 && !disabled) {
      setEditing(true);
    }
  };

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <Container>
      {label && editing && (
        <Label
          error={!!error}
          size={size}
          text={label}
          disabled={disabled}
          position="top"
          required={required}
          hint={hint}
        />
      )}

      {editing ? (
        <div onBlur={handleOnBlur} onKeyDown={(e) => handleKeyDown(e)}>
          <input {...field} ref={inputRef} />
        </div>
      ) : (
        <div onClick={handleOnClick}>
          <span>{field.value || (value as string)}</span>
        </div>
      )}
      {error && <ErrorMessage message={error.message!} />}
    </Container>
  );
};
