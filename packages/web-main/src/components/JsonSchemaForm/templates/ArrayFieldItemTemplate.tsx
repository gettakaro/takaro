import { CSSProperties } from 'react';
import { ArrayFieldItemTemplateProps, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { styled } from '@takaro/lib-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing[1]};
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export function ArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldItemTemplateProps<T, S, F>) {
  const { children, disabled, hasToolbar, readonly, uiSchema, registry, buttonsProps } = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } = registry.templates.ButtonTemplates;
  const { hasMoveUp, hasMoveDown, hasCopy, hasRemove, onCopyItem, onMoveDownItem, onMoveUpItem, onRemoveItem } =
    buttonsProps;
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
        <FlexContainer>
          {(hasMoveUp || hasMoveDown) && (
            <MoveUpButton
              style={btnStyle}
              disabled={disabled || readonly || !hasMoveUp}
              onClick={onMoveUpItem}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {(hasMoveUp || hasMoveDown) && (
            <MoveDownButton
              style={btnStyle}
              disabled={disabled || readonly || !hasMoveDown}
              onClick={onMoveDownItem}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {hasCopy && (
            <CopyButton
              style={btnStyle}
              disabled={disabled || readonly}
              onClick={onCopyItem}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {hasRemove && (
            <RemoveButton
              style={btnStyle}
              disabled={disabled || readonly}
              onClick={onRemoveItem}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
        </FlexContainer>
      )}
    </Container>
  );
}
