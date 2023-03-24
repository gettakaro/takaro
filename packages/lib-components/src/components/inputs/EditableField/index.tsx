import {
  FC,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Container } from './style';

export interface EditableFieldProps {
  isEditing?: boolean;
  editingChange?: (editing: boolean) => unknown;
  placeholder?: string;
  // fires when the input value is changed
  onEdited?: (value: string) => unknown;

  disabled?: boolean;
  allowEmpty: boolean;
  required?: boolean;
  name: string;
  loading?: boolean;

  // defaultval
  value?: string;
}

/*
const defaultsApplier = defaultInputPropsFactory<EditableFieldProps>({
  ...defaultInputProps,
  required: true,
});
*/

export const EditableField: FC<EditableFieldProps> = ({
  isEditing = false,
  required = false,
  value = '',
  name,
  disabled = false,
  onEdited,
  editingChange = () => {},
  loading = false,
}) => {
  const [editing, setEditing] = useState(isEditing);
  const [inputValue, setInputValue] = useState<string>(value);
  const [spanValue, setSpanValue] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef && inputRef.current && editing === true) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, inputRef]);

  useEffect(() => {
    if (!editing && inputValue != spanValue) {
      if (onEdited) {
        onEdited(inputValue);
      }
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
      {editing ? (
        <div onBlur={handleOnBlur} onKeyDown={(e) => handleKeyDown(e)}>
          <input
            ref={inputRef}
            name={name}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
          />
        </div>
      ) : (
        <div onClick={handleOnClick}>
          <span>{spanValue}</span>
        </div>
      )}
    </Container>
  );
};
