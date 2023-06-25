import {
  DescriptionFieldProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

export function DescriptionFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ description, id }: DescriptionFieldProps<T, S, F>) {
  if (!description) {
    return null;
  }

  if (typeof description === 'string') {
    return <p id={id}>{description}</p>;
  }

  return <>{description}</>;
}
