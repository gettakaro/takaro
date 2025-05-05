import { SelectField, TextField } from '..';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { MouseEvent, useState, forwardRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DurationContainer, FieldContainer, InnerContent, ButtonContainer } from './style';
import { Button, IconButton, Popover, Tooltip } from '../../../components';
import { Duration } from 'luxon';
import { GenericInputPropsFunctionHandlers } from '../InputProps';
import {
  AiOutlineDelete as RemoveIcon,
  AiOutlinePlus as AddIcon,
  AiOutlineClose as ResetIcon,
  AiOutlineDown as ArrowIcon,
} from 'react-icons/ai';

const durationObjectToUnitAndValue = (millis: number): { unit: LuxonUnit; value: number }[] => {
  // fallback, otherwise there is is no option to set a new duration.
  if (millis === 0) {
    return [{ unit: 'milliseconds', value: 0 }];
  }

  const obj = Duration.fromMillis(millis).rescale().toObject();
  return Object.entries(obj).map(([unit, value]) => {
    return { unit: unit as LuxonUnit, value: value || 0 };
  });
};

export interface DurationProps {
  placeholder?: string;
  canClear?: boolean;
}

type LuxonUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
const luxonUnits = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'] as const;

const validationSchema = z.object({
  durations: z.array(
    z.object({
      value: z.number().positive(),
      unit: z.enum(luxonUnits), // Use updated units array
    }),
  ),
});

export type GenericDurationFieldProps = DurationProps & GenericInputPropsFunctionHandlers<number, HTMLDivElement>;
export const GenericDurationField = forwardRef<HTMLDivElement, GenericDurationFieldProps>(function GenericDurationField(
  {
    onChange,
    hasError,
    value,
    name,
    disabled = false,
    readOnly = false,
    canClear = false,
    placeholder = 'Select a duration',
    onBlur,
    onFocus,
  },
  ref,
) {
  const { control, handleSubmit, setValue } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      durations: value || value === 0 ? durationObjectToUnitAndValue(value) : [],
    },
  });

  const { fields, remove: removeField, append: addField } = useFieldArray({ control, name: 'durations' });
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (open && value == undefined && fields.length === 0) {
      addField({ value: 0, unit: 'seconds' });
    }
  }, [open]);

  useEffect(() => {
    if (value || value == 0) {
      setValue('durations', durationObjectToUnitAndValue(value));
    }
  }, [value]);

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ durations }) => {
    const totalDuration = durations.reduce((accumulator, { value, unit }) => {
      const duration = Duration.fromObject({ [unit]: value });
      return accumulator.plus(duration);
    }, Duration.fromMillis(0));
    onChange(totalDuration.toMillis());
    setOpen(false);
  };

  const handleReset = (e: MouseEvent) => {
    e.stopPropagation();
    onChange(undefined as unknown as number);
  };

  const formId = `${name}-form`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <DurationContainer
          disabled={disabled}
          readOnly={readOnly}
          aria-disabled={disabled}
          aria-readonly={readOnly}
          ref={ref}
          hasError={hasError}
          aria-labelledby={name}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={() => !readOnly && !disabled && setOpen(!open)}
        >
          {value ? Duration.fromMillis(value).rescale().toHuman({ listStyle: 'long' }) : placeholder}

          {canClear && !readOnly && !disabled && value && !open ? (
            <IconButton icon={<ResetIcon />} ariaLabel="Reset duration" onClick={handleReset} />
          ) : (
            <ArrowIcon size={16} />
          )}
        </DurationContainer>
      </Popover.Trigger>
      <Popover.Content>
        <InnerContent>
          <form id={formId}>
            <h2>Select a duration</h2>
            {fields.map((field, index) => (
              <FieldContainer hasMultipleFields={fields.length > 1} key={`${name}-${field.id}-${index}`} id={field.id}>
                <TextField
                  key={`${name}-${index}-value`}
                  name={`durations.${index}.value`}
                  control={control}
                  type="number"
                />
                <SelectField
                  key={`${name}-${index}-unit`}
                  control={control}
                  name={`durations.${index}.unit`}
                  multiple={false}
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      return <div>Select...</div>;
                    }
                    return <div>{selectedItems[0].label}</div>;
                  }}
                >
                  <SelectField.OptionGroup key={`${name}-${index}-option-group`}>
                    {luxonUnits.map((unit) => (
                      <SelectField.Option key={`${name}-${index}-option-${unit}`} value={unit} label={unit}>
                        {unit}
                      </SelectField.Option>
                    ))}
                  </SelectField.OptionGroup>
                </SelectField>
                {fields.length !== 1 && (
                  <Tooltip key={`${name}-${index}-remove-field`}>
                    <Tooltip.Trigger>
                      <IconButton ariaLabel="Remove field" icon={<RemoveIcon />} onClick={() => removeField(index)} />
                    </Tooltip.Trigger>
                    <Tooltip.Content>Remove field</Tooltip.Content>
                  </Tooltip>
                )}
                {index === fields.length - 1 && fields.length < luxonUnits.length && (
                  <Tooltip key={`${name}-${index}-add-field`}>
                    <Tooltip.Trigger>
                      <IconButton
                        icon={<AddIcon />}
                        ariaLabel="Add field"
                        onClick={() => addField({ value: 0, unit: 'seconds' })}
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Content>Add field</Tooltip.Content>
                  </Tooltip>
                )}
              </FieldContainer>
            ))}
            <ButtonContainer>
              <Button
                form={formId}
                type="submit"
                fullWidth
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }}
              >
                Apply
              </Button>
            </ButtonContainer>
          </form>
        </InnerContent>
      </Popover.Content>
    </Popover>
  );
});
