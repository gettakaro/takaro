import { Divider, styled } from '@takaro/lib-components';
import { FormContextType, TitleFieldProps, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';

const Container = styled.div`
  margin: ${({ theme }) => theme.spacing['0_5']} 0;
  h4 {
    text-transform: capitalize;
  }
`;

/** The `TitleField` is the template to use to render the title of a field
 *
 * @param props - The `TitleFieldProps` for this component
 */
export function TitleFieldTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  id,
  title,
}: TitleFieldProps<T, S, F>) {
  return (
    <Container id={id}>
      <h4>{title}</h4>
      <Divider fullWidth />
    </Container>
  );
}
