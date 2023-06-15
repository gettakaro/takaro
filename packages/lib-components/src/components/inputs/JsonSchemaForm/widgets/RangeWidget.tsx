import {
  FormContextType,
  rangeSpec,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericSlider } from '../../Slider';

// TODO: implement multiselect
export function RangeWidget<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  disabled,
  rawErrors,
  required,
  schema,
  name,
  value,
  label,
  readonly,
  onChange,
}: WidgetProps<T, S, F>) {
  const sliderProps = { value, label, name, ...rangeSpec<S>(schema) };

  return (
    <GenericSlider
      name={name}
      value={value}
      min={sliderProps.min ? sliderProps.min : 0}
      max={sliderProps.max ? sliderProps.max : 100}
      step={sliderProps.step ? sliderProps.step : 1}
      showDots={true}
      readOnly={readonly}
      disabled={disabled}
      onChange={onChange}
      onBlur={() => {
        /* placeholder */
      }}
      required={required}
      hasError={!!rawErrors && !!rawErrors.length}
    />
  );
}
