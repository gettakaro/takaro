import { FC, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../layout';
import { z } from 'zod';
import { Container } from './style';

export interface EditableFieldProps {
  isEditing?: boolean;
  editingChange?: (editing: boolean) => unknown;
  placeholder?: string;

  // fires when the input value is changed
  onEdited?: (value: string) => unknown;

  validationSchema?: z.ZodSchema;

  disabled?: boolean;
  required?: boolean;
  name: string;
  loading?: boolean;

  // defaultval
  value?: string;
}

export const EditableField: FC<EditableFieldProps> = ({
  isEditing = false,
  required = false,
  value = '',
  name,
  disabled = false,
  onEdited,
  validationSchema,
  editingChange = () => {},
  loading = false,
}) => {
  const [editing, setEditing] = useState(isEditing);
  const [inputValue, setInputValue] = useState<string>(value);
  const [spanValue, setSpanValue] = useState<string>(value);
  const [error, setError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef && inputRef.current && editing === true) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, inputRef]);

  useEffect(() => {
    if (!editing && inputValue != spanValue && onEdited && !error) {
      onEdited(inputValue);
      setSpanValue(inputValue);
    }
    editingChange(editing);
  }, [editing]);

  // change editing state when new isEditing prop is passed
  useEffect(() => {
    if (isEditing !== editing) {
      setEditing(isEditing);
    }
  }, [isEditing]);

  // handle focus change
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    const keys = ['Escape', 'Tab', 'Enter'];

    if (required && inputRef.current?.value == '') {
      return;
    }

    if (keys.indexOf(key) > -1 && inputRef.current && !disabled && !error) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setInputValue(newValue);
    validateInput(newValue);
  };

  const validateInput = (value: string) => {
    if (!validationSchema) {
      return;
    }

    const validationResult = validationSchema.safeParse(value);
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
    } else {
      setError(undefined);
    }
  };

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <Container>
      {editing ? (
        <div onBlur={handleOnBlur} onKeyDown={(e) => handleKeyDown(e)}>
          <input
            type="text"
            ref={inputRef}
            name={name}
            value={inputValue}
            aria-required={required}
            onChange={handleChange}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      ) : (
        <div onClick={handleOnClick}>
          <span>{spanValue}</span>
        </div>
      )}
    </Container>
  );
};
