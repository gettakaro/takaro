import { errorId, FieldErrorProps, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { ErrorMessage } from '@takaro/lib-components';

/** The `FieldErrorTemplate` component renders the errors local to the particular field
 *
 * @param props - The `FieldErrorProps` for the errors being rendered
 */
export function FieldErrorTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  errors,
  fieldPathId,
}: FieldErrorProps<T, S, F>) {
  if (errors && errors.length > 0) {
    const id = errorId(fieldPathId);
    return <ErrorMessage key={id} message={errors[0] as string} />;
  }
  return null;
}
