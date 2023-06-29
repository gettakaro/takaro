import {
  FormContextType,
  rangeSpec,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericSlider } from '../../Slider';
import { styled } from '../../../../styled';

const Container = styled.div`
  padding: 2.5rem 1.5rem 0 1.5rem;
`;

// TODO: implement multiselect
export function RangeWidget<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  disabled,
  rawErrors = [],
  required,
  schema,
  name,
  id,
  value,
  readonly,
  onChange,
}: WidgetProps<T, S, F>) {
  const { min = 0, max = 100, step = 1 } = { ...rangeSpec<S>(schema) };

  return (
    <Container>
      <GenericSlider
        id={id}
        name={name}
        value={value}
        min={min}
        max={max}
        step={step}
        showDots={false}
        readOnly={readonly}
        disabled={disabled}
        onChange={onChange}
        onBlur={() => {
          /* placeholder */
        }}
        required={required}
        hasError={!!rawErrors.length}
        hasDescription={!!schema.description}
      />
    </Container>
  );
}
