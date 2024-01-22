import { SelectField, TextField } from '..';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { AiOutlineDelete as RemoveIcon, AiOutlinePlus as AddIcon } from 'react-icons/ai';
import { z } from 'zod';
import { useState, forwardRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DurationContainer, FieldContainer, InnerContent, ButtonContainer } from './style';
import { Button, IconButton, Popover, Tooltip } from '../../../components';
import { Duration } from 'luxon';
import { GenericInputPropsFunctionHandlers } from '../InputProps';

const durationObjectToUnitAndValue = (millis: number): { unit: LuxonUnit; value: number }[] => {
  const obj = Duration.fromMillis(millis).rescale().toObject();

  return Object.entries(obj).map(([unit, value]) => {
    return { unit: unit as LuxonUnit, value: value || 0 };
  });
};

export interface DurationProps {
  placeholder?: string;
}

type LuxonUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
const luxonUnits = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'] as const;

const validationSchema = z.object({
  durations: z.array(
    z.object({
      value: z.number().positive(),
      unit: z.enum(luxonUnits), // Use updated units array
    })
  ),
});

export type GenericDurationFieldProps = DurationProps & GenericInputPropsFunctionHandlers<number, HTMLDivElement>;
export const GenericDurationField = forwardRef<HTMLDivElement, GenericDurationFieldProps>(
  ({ onChange, hasError, value, name, disabled = false, readOnly = false, placeholder }, ref) => {
    const { control, handleSubmit, setValue } = useForm<z.infer<typeof validationSchema>>({
      mode: 'onSubmit',
      resolver: zodResolver(validationSchema),
      defaultValues: {
        durations: value ? durationObjectToUnitAndValue(value) : [],
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
      if (value) {
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

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <DurationContainer
            aria-role="button"
            disabled={disabled}
            readOnly={readOnly}
            aria-disabled={disabled}
            aria-readonly={readOnly}
            ref={ref}
            hasError={hasError}
            aria-labelledby={name}
            onClick={() => !readOnly && !disabled && setOpen(!open)}
          >
            {value ? Duration.fromMillis(value).rescale().toHuman() : placeholder}
          </DurationContainer>
        </Popover.Trigger>
        <Popover.Content>
          <InnerContent>
            {fields.length >= 1 && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h2>Select a duration</h2>
                {fields.map((field, index) => (
                  <FieldContainer
                    hasMultipleFields={fields.length > 1}
                    key={`${name}-${field.id}-${index}`}
                    id={field.id}
                  >
                    <TextField key={`${name}-`} name={`durations.${index}.value`} control={control} type="number" />
                    <SelectField
                      inPortal
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
                      <SelectField.OptionGroup>
                        {luxonUnits.map((unit) => (
                          <SelectField.Option value={unit} label={unit}>
                            {unit}
                          </SelectField.Option>
                        ))}
                      </SelectField.OptionGroup>
                    </SelectField>
                    {fields.length !== 1 && (
                      <Tooltip>
                        <Tooltip.Trigger>
                          <IconButton
                            ariaLabel="Remove field"
                            icon={<RemoveIcon />}
                            onClick={() => removeField(index)}
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Content>Remove field</Tooltip.Content>
                      </Tooltip>
                    )}
                    {index === fields.length - 1 && (
                      <Tooltip>
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
                  <Button type="button" variant="clear" text="Cancel" onClick={() => setOpen(false)} />
                  <Button type="submit" text="Apply" />
                </ButtonContainer>
              </form>
            )}
          </InnerContent>
        </Popover.Content>
      </Popover>
    );
  }
);
