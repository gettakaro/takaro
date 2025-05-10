import { Button } from '@takaro/lib-components';
import { getSubmitButtonOptions, FormContextType, RJSFSchema, StrictRJSFSchema, SubmitButtonProps } from '@rjsf/utils';

/** The `SubmitButton` renders a button that represent the `Submit` action on a form
 */
export function SubmitButton<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  uiSchema,
}: SubmitButtonProps<T, S, F>) {
  const { submitText, norender, props } = getSubmitButtonOptions<T, S, F>(uiSchema);
  if (norender || props === undefined || submitText === undefined) {
    return null;
  }

  return (
    <Button type="submit" color="primary" disabled={props.disabled} className={props.className}>
      {submitText}
    </Button>
  );
}
