import {
  getUiOptions,
  titleId,
  ArrayFieldTitleProps,
  FormContextType,
  RJSFSchema,
  getTemplate,
  StrictRJSFSchema,
} from '@rjsf/utils';

export function ArrayFieldTitleTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTitleProps<T, S, F>) {
  const { idSchema, title, uiSchema, registry, schema } = props;
  const options = getUiOptions<T, S, F>(uiSchema, registry.globalUiOptions);
  const { label: displayLabel = true } = options;
  if (!title || !displayLabel) {
    return null;
  }

  const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', T, S, F>('TitleFieldTemplate', registry, options);

  return (
    <TitleFieldTemplate
      id={titleId<T>(idSchema)}
      title={title}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    />
  );
}
