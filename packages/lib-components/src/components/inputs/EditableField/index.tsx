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
  editable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  childRef: MutableRefObject<HTMLInputElement | null>;
}

const Container = styled.div`
  input {
    border: 1px solid black;
    padding: 0.5rem;
  }
`;

export const EditableField: FC<PropsWithChildren<EditableFieldProps>> = ({
  text,
  placeholder,
  editable = false,
  disabled = false,
  children,
  childRef,
}) => {
  const [isEditing, setEditing] = useState(editable);

  useEffect(() => {
    if (childRef && childRef.current && isEditing === true) {
      childRef.current.focus();
      childRef.current.select();
    }
  }, [isEditing, childRef]);

  useEffect(() => {
    setEditing(editable);
  }, [editable]);

  // handle focus change
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    const keys = ['Escape', 'Tab', 'Enter'];
    if (keys.indexOf(key) > -1 && childRef.current && !disabled) {
      setEditing(false);
    }
  };

  const handleOnClick = ({ detail }: MouseEvent<HTMLDivElement>) => {
    // double click
    if (detail == 2 && !disabled) {
      setEditing(true);
    }
  };

  return (
    <Container>
      {isEditing ? (
        <div
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => handleKeyDown(e)}
        >
          {children}
        </div>
      ) : (
        <div onClick={handleOnClick}>
          <span>{text || placeholder}</span>
        </div>
      )}
    </Container>
  );
};
