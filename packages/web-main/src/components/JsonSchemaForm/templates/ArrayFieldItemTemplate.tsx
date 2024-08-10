import { CSSProperties } from 'react';
import { ArrayFieldTemplateItemType, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { styled } from '@takaro/lib-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
`;

/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export function ArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateItemType<T, S, F>) {
  const {
    children,
    disabled,
    hasToolbar,
    hasCopy,
    hasMoveDown,
    hasMoveUp,
    hasRemove,
    index,
    onCopyIndexClick,
    onDropIndexClick,
    onReorderClick,
    readonly,
    uiSchema,
    registry,
  } = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } = registry.templates.ButtonTemplates;
  const btnStyle: CSSProperties = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold',
    minWidth: 0,
  };
  return (
    <Container>
      <div>{children}</div>
      {hasToolbar && (
        <div>
          {(hasMoveUp || hasMoveDown) && (
            <MoveUpButton
              style={btnStyle}
              disabled={disabled || readonly || !hasMoveUp}
              onClick={onReorderClick(index, index - 1)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {(hasMoveUp || hasMoveDown) && (
            <MoveDownButton
              style={btnStyle}
              disabled={disabled || readonly || !hasMoveDown}
              onClick={onReorderClick(index, index + 1)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {hasCopy && (
            <CopyButton
              style={btnStyle}
              disabled={disabled || readonly}
              onClick={onCopyIndexClick(index)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {hasRemove && (
            <RemoveButton
              style={btnStyle}
              disabled={disabled || readonly}
              onClick={onDropIndexClick(index)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
        </div>
      )}
    </Container>
  );
}
