import {
  FC,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';

import { styled } from '../../../styled';

export interface EditableFieldProps {
  text?: string;
  isEditing?: boolean;
  placeholder?: string;
  onEdited?: () => unknown;
  disabled?: boolean;
  allowEmpty: boolean;
  childRef: MutableRefObject<HTMLInputElement | null>;
}

const Container = styled.div`
  input {
    border: 1px solid ${({ theme }) => theme.colors.gray};
    padding: 0.5rem;
  }
`;

const ErrorMessage = styled.span`
  display: block;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const EditableField: FC<PropsWithChildren<EditableFieldProps>> = ({
  text,
  placeholder,
  isEditing = false,
  disabled = false,
  allowEmpty,
  onEdited,
  children,
  childRef,
}) => {
  const [editing, setEditing] = useState(isEditing);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (childRef && childRef.current && editing === true) {
      childRef.current.focus();
      childRef.current.select();
    }
  }, [editing, childRef]);

  useEffect(() => {
    console.log('on edited', onEdited);
    console.log('editing', editing);
    console.log('childref', childRef);
    console.log('childref', childRef.current);
    if (onEdited && editing == false) {
      onEdited();
    }
  }, [editing]);

  useEffect(() => {
    if (isEditing) {
      setEditing(true);
    }
  }, [isEditing]);

  // handle focus change
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    const keys = ['Escape', 'Tab', 'Enter'];

    if (!allowEmpty && childRef.current?.value == '') {
      setError('Field cannot be empty!');
      return;
    }

    if (keys.indexOf(key) > -1 && childRef.current && !disabled) {
      setError('');
      setEditing(false);
    }
  };

  const handleOnBlur = () => {
    if (!allowEmpty && childRef.current?.value == '') {
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
