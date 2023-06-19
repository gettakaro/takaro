import { Label } from '../../../../components';
import { styled } from '../../../../styled';

const Container = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  position: relative;

  p {
    margin-top: ${({ theme }) => theme.spacing['0_5']};
    color: ${({ theme }) => theme.colors.textAlt};
    white-space: pre-wrap;
    line-height: 1.5;
  }
`;

import {
  FieldTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

/** The `FieldTemplate` component is the template used by `SchemaField` to render any field. It renders the field
 * content, (label, description, children, errors and help) inside of a `WrapIfAdditional` component.
 *
 * @param props - The `FieldTemplateProps` for this component
 */
export function FieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: FieldTemplateProps<T, S, F>) {
  const {
    id,
    children,
    disabled,
    displayLabel,
    hidden,
    label,
    required,
    errors,
    description,
    rawErrors = [],
    rawDescription,
  } = props;

  if (hidden) {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  return (
    <Container>
      <Label
        disabled={disabled}
        position="top"
        required={required ? required : false}
        error={!!rawErrors.length}
        text={label}
        htmlFor={id}
        size="medium"
      />
      {children}
      {errors}
      {displayLabel && rawDescription && description}
    </Container>
  );
}
