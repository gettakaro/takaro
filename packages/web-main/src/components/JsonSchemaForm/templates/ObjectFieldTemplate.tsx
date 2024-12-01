import {
  FormContextType,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  canExpand,
  descriptionId,
  getTemplate,
  getUiOptions,
  titleId,
} from '@rjsf/utils';

import { Collapsible, styled } from '@takaro/lib-components';

const ItemContainer = styled.div<{ isTopLevel: boolean }>`
  margin-bottom: 10px;
  border: 2px solid ${({ theme, isTopLevel }) => (isTopLevel ? theme.colors.backgroundAlt : 'none')};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ isTopLevel, theme }) => (isTopLevel ? theme.spacing[1] : '0px')};
`;

/** The `ObjectFieldTemplate` is the template to use to render all the inner properties of an object along with the
 * title and description if available. If the object is expandable, then an `AddButton` is also rendered after all
 * the properties.
 *
 * @param props - The `ObjectFieldTemplateProps` for this component
 */
export function ObjectFieldTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: ObjectFieldTemplateProps<T, S, F>,
) {
  const {
    description,
    title,
    properties,
    required,
    disabled,
    readonly,
    uiSchema,
    idSchema,
    schema,
    formData,
    onAddClick,
    registry,
  } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', T, S, F>('TitleFieldTemplate', registry, uiOptions);
  const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>(
    'DescriptionFieldTemplate',
    registry,
    uiOptions,
  );
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  function isParentCommandHookCronjob() {
    if (
      idSchema['$id'] === 'root_commands' ||
      idSchema['$id'] === 'root_hooks' ||
      idSchema['$id'] === 'root_cronJobs'
    ) {
      return true;
    }
    return false;
  }

  function isTopLevelObject(idSchema: any): boolean {
    return idSchema['$id'] === 'root';
  }

  return (
    <div>
      {/* if parent title is commands/cronjobs/hooks then dont render */}
      {title && isParentCommandHookCronjob() && (
        <TitleFieldTemplate
          id={titleId<T>(idSchema)}
          title={title}
          required={required}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      {description && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(idSchema)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <div>
        {properties.map((element, index) => {
          if (title === 'commands' || title === 'hooks' || title === 'cronJobs') {
            return (
              <Collapsible key={`element-${title}-${index}`}>
                <Collapsible.Trigger>{element.name}</Collapsible.Trigger>
                <Collapsible.Content>{element.content}</Collapsible.Content>
              </Collapsible>
            );
          }

          return element.hidden ? (
            element.content
          ) : (
            <ItemContainer key={`element-${title}-${index}`} isTopLevel={isTopLevelObject(idSchema)}>
              {element.content}
            </ItemContainer>
          );
        })}

        {canExpand<T, S, F>(schema, uiSchema, formData) && (
          <div>
            <div>
              <AddButton
                onClick={onAddClick(schema)}
                disabled={disabled || readonly}
                uiSchema={uiSchema}
                registry={registry}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
