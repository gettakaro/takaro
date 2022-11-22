import {
  FC,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';

import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';

import { Container, ErrorMessage } from './style';

export interface EditableFieldProps extends InputProps {
  text?: string;
  isEditing?: boolean;
  placeholder?: string;
  onEdited?: () => unknown;
  disabled?: boolean;
  allowEmpty: boolean;
  childRef: MutableRefObject<HTMLInputElement | null>;
}

const defaultsApplier =
  defaultInputPropsFactory<PropsWithChildren<EditableFieldProps>>(
    defaultInputProps
  );

export const EditableField: FC<PropsWithChildren<EditableFieldProps>> = (
  props
) => {
  const {
    isEditing = false,
    disabled,
    childRef,
    required,
    children,
    text,
    placeholder,
  } = defaultsApplier(props);

  const [editing, setEditing] = useState(isEditing);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (childRef && childRef.current && editing === true) {
      childRef.current.focus();
      childRef.current.select();
    }
  }, [editing, childRef]);

  useEffect(() => {
    if (isEditing) {
      setEditing(true);
    }
  }, [isEditing]);

  // handle focus change
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    const keys = ['Escape', 'Tab', 'Enter'];

    if (required && childRef.current?.value == '') {
      setError('Field cannot be empty!');
      return;
    }

    if (keys.indexOf(key) > -1 && childRef.current && !disabled) {
      setError('');
      setEditing(false);
    }
  };

  const handleOnBlur = () => {
    if (required && childRef.current?.value == '') {
      setError('field cannot be empty!');
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

  return (
    <Container>
      {editing ? (
        <div onBlur={handleOnBlur} onKeyDown={(e) => handleKeyDown(e)}>
          {children}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
      ) : (
        <div onClick={handleOnClick}>
          <span>{text || placeholder}</span>
        </div>
      )}
    </Container>
  );
};
