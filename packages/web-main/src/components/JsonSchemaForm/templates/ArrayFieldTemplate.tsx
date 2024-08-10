import {
  getTemplate,
  getUiOptions,
  ArrayFieldTemplateProps,
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { styled } from '@takaro/lib-components';

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['2']};
`;

const ItemListContainer = styled.div``;

/** The `ArrayFieldTemplate` component is the template used to render all items in an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export function ArrayFieldTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: ArrayFieldTemplateProps<T, S, F>,
) {
  const { canAdd, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, schema, title } =
    props;
  const uiOptions = getUiOptions(uiSchema);
  const ArrayFieldDescriptionTemplate = getTemplate<'ArrayFieldDescriptionTemplate', T, S, F>(
    'ArrayFieldDescriptionTemplate',
    registry,
    uiOptions,
  );

  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  );

  const ArrayFieldTitleTemplate = getTemplate<'ArrayFieldTitleTemplate', T, S, F>(
    'ArrayFieldTitleTemplate',
    registry,
    uiOptions,
  );

  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;
  return (
    <Container>
      <ArrayFieldTitleTemplate
        idSchema={idSchema}
        title={title}
        schema={schema}
        uiSchema={uiSchema}
        required={required}
        registry={registry}
      />
      <ArrayFieldDescriptionTemplate
        idSchema={idSchema}
        description={schema.description}
        schema={schema}
        uiSchema={uiSchema}
        registry={registry}
      />
      <ItemListContainer key={`array-item-list-${idSchema.$id}`}>
        {items &&
          items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
            <ArrayFieldItemTemplate key={key} {...itemProps} />
          ))}
        {canAdd && (
          <AddButton
            className="array-item-add"
            onClick={onAddClick}
            disabled={disabled || readonly}
            uiSchema={uiSchema}
            registry={registry}
          />
        )}
      </ItemListContainer>
    </Container>
  );
}
