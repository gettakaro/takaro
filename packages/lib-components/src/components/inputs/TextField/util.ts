import { FieldType } from '.';

export const getFieldType = (type: FieldType, passwordVisible: boolean) => {
  // we only use the type number to transform the output to number
  // so that zod is happy
  if (passwordVisible || type === 'number') {
    return 'text';
  }

  return type;
};

type InputModes =
  | 'text'
  | 'email'
  | 'search'
  | 'tel'
  | 'url'
  | 'none'
  | 'numeric'
  | 'decimal';

export const getInputMode = (type: FieldType): InputModes => {
  if (type === 'password') return 'text';
  if (type === 'number') return 'numeric';
  return type;
};
