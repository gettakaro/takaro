import { FocusEvent } from 'react';
import {
  schemaRequiresTrueValue,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
  descriptionId,
  getTemplate,
} from '@rjsf/utils';
import { GenericCheckBox } from '../../CheckBox';
import { Container } from '../../CheckBox/style';
import { Label } from '../../../../components';
import { Wrapper } from '../../layout';

export function CheckBoxWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: WidgetProps<T, S, F>
) {
  const {
    schema,
    name,
    disabled = false,
    readonly,
    onChange,
    value,
    id,
    rawErrors = [],
    registry,
    onBlur,
    onFocus,
    label,
    hideLabel,
    uiSchema,
    options,
  } = props;

  const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>(
    'DescriptionFieldTemplate',
    registry,
    options
  );
  const description = options.description || schema.description;

  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue<S>(schema);

  const _onBlur = ({ target: { checked } }: FocusEvent<HTMLInputElement>) => onBlur(id, checked);
  const _onFocus = ({ target: { checked } }: FocusEvent<HTMLInputElement>) => onFocus(id, checked);

  return (
    <Wrapper>
      <Container>
        <Label
          disabled={disabled}
          position="left"
          required={required ? required : false}
          error={!!rawErrors.length}
          text={label}
          htmlFor={id}
          size="medium"
        />

        <GenericCheckBox
          id={id}
          name={name}
          value={value}
          readOnly={readonly}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={_onBlur}
          onFocus={_onFocus}
          required={required}
          hasError={!!rawErrors.length}
          hasDescription={!!description}
        />
      </Container>
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
    </Wrapper>
  );
}
