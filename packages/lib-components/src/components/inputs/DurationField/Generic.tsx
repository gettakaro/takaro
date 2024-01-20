import { SelectField, TextField } from '..';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { AiOutlineDelete as RemoveIcon, AiOutlinePlus as AddIcon } from 'react-icons/ai';
import { z } from 'zod';
import { useState, forwardRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DurationContainer, FieldContainer, InnerContent } from './style';
import { Button, IconButton, Popover } from '../../../components';
import { Duration } from 'luxon';
import { GenericInputPropsFunctionHandlers } from '../InputProps';

export interface DurationProps {
  placeholder?: string;
}

const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'] as const;
const validationSchema = z.object({
  durations: z.array(
    z.object({
      value: z.number().positive(),
      unit: z.enum(units),
    })
  ),
});

export type GenericDurationFieldProps = DurationProps & GenericInputPropsFunctionHandlers<number, HTMLDivElement>;
export const GenericDurationField = forwardRef<HTMLDivElement, GenericDurationFieldProps>(
  ({ onChange, hasError, value, name, disabled, readOnly, placeholder }, ref) => {
    // TODO: set default value by converting value to durations

    const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
      resolver: zodResolver(validationSchema),
      defaultValues: {
        // value ? Duration.fromMillis(value).rescale().toObject() : { durations: [] }
      },
    });

    const { fields, remove: removeField, append: addField } = useFieldArray({ control, name: 'durations' });
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
      if (open && value == undefined) {
        addField({ value: 0, unit: 'seconds' });
      }
    }, [open]);

    const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ durations }) => {
      const totalDuration = durations.reduce((accumulator, { value, unit }) => {
        const duration = Duration.fromObject({ [unit]: value });
        return accumulator.plus(duration);
      }, Duration.fromMillis(0));
      onChange(totalDuration.toMillis());
      setOpen(false);
    };

    return (
      <Popover open={open}>
        <Popover.Trigger asChild>
          <DurationContainer
            ref={ref}
            hasError={hasError}
            aria-labelledby={name}
            onClick={() => !readOnly && !disabled && setOpen(!open)}
          >
            {value ? Duration.fromMillis(value).toHuman() : placeholder}
          </DurationContainer>
        </Popover.Trigger>
        <Popover.Content>
          <InnerContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {fields.map((field, index) => (
                <FieldContainer key={`${name}-${field.id}-${index}`} id={field.id}>
                  <TextField name={`durations.${index}`} control={control} type="number" />
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
                      {units.map((unit) => (
                        <SelectField.Option value={unit} label={unit}>
                          {unit}
                        </SelectField.Option>
                      ))}
                    </SelectField.OptionGroup>
                  </SelectField>
                  {index === fields.length - 1 && (
                    <IconButton
                      icon={<AddIcon />}
                      ariaLabel="Add field"
                      onClick={() => addField({ value: 0, unit: 'seconds' })}
                    />
                  )}
                  {index > 0 && (
                    <IconButton ariaLabel="Remove field" icon={<RemoveIcon />} onClick={() => removeField(index)} />
                  )}
                </FieldContainer>
              ))}
              <Button type="submit" text="save" />
            </form>
          </InnerContent>
        </Popover.Content>
      </Popover>
    );
  }
);
