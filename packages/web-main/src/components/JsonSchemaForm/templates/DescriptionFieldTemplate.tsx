import { DescriptionFieldProps, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { Description } from '@takaro/lib-components';

export function DescriptionFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ description, id }: DescriptionFieldProps<T, S, F>) {
  if (!description) {
    return null;
  }

  if (typeof description === 'string') {
    return <Description description={description} inputName={id} />;
  }

  return <>{description}</>;
}
