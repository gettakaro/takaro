import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Button, IconButton, Popover, Tooltip } from '../../../components';
import { AiOutlineFilter as FilterIcon, AiOutlineClose as RemoveIcon } from 'react-icons/ai';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonContainer, Container, FilterActions, FilterContainer, StyledForm } from './style';
import { FilterRow } from './field';
import { DevTool } from '@hookform/devtools';
import { Operator } from './operator';

export enum FilterInputType {
  string = 'string',
  number = 'number',
  uuid = 'uuid',
  datetime = 'datetime',
}

export interface IFormInputs {
  filters: {
    name: string;
    operator: Operator;
    value: string;
    type: FilterInputType;
  }[];
}

export type FilterField = {
  name: string;
  type: FilterInputType;
};

export type FilterProps = {
  filterFields: FilterField[];
};

export const Filter: FC<FilterProps> = ({ filterFields }) => {
  const [open, setOpen] = useState<boolean>(false);

  const basedShape = z.object({
    name: z.string().nonempty({
      message: 'Please select a valid field.',
    }),
    operator: z.nativeEnum(Operator, {
      errorMap: () => {
        return {
          message: 'Condition is required.',
        };
      },
    }),
  });

  const validationSchema = useMemo(() => {
    return z.object({
      filters: z.array(
        z
          .discriminatedUnion('type', [
            z.object({
              type: z.literal(FilterInputType.string),
              value: z.string().nonempty({
                message: 'Value is required.',
              }),
            }),
            z.object({
              type: z.literal(FilterInputType.uuid),
              value: z.string().uuid().nonempty({
                message: 'Value is required.',
              }),
            }),
            z.object({
              type: z.literal(FilterInputType.datetime),
              value: z.string().datetime().nonempty({
                message: 'Value is required.',
              }),
            }),
          ])
          .and(basedShape)
      ),
    });
  }, [filterFields]);

  const { control, handleSubmit, setValue } = useForm<IFormInputs>({
    mode: 'onSubmit',

    resolver: zodResolver(validationSchema),
    defaultValues: {
      filters: [
        {
          name: '',
          operator: Operator.is,
          value: '',
          type: FilterInputType.uuid,
        },
      ],
    },
  });

  const { append, fields, remove } = useFieldArray({ name: 'filters', control });

  const handleClearFilters = useCallback(() => {
    remove();
    append({
      name: '',
      operator: Operator.is,
      value: '',
      type: FilterInputType.string,
    });
  }, [remove]);

  useEffect(() => {
    if (fields.length === 0) {
      append({
        name: '',
        operator: Operator.is,
        value: '',
        type: FilterInputType.string,
      });
    }
  }, [fields]);

  // filters contains both column filters and global filters
  const onSubmit: SubmitHandler<IFormInputs> = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger asChild>
        <IconButton icon={<FilterIcon />} onClick={() => setOpen(!open)} size="large" ariaLabel="filter" />
      </Popover.Trigger>
      <Popover.Content>
        <Container>
          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field, index) => {
              return (
                <FilterContainer key={field.id} hasMultipleFields={fields.length > 1}>
                  {fields.length > 1 && (
                    <Tooltip key={`remove-${field.id}`}>
                      <Tooltip.Trigger asChild>
                        <IconButton
                          size="tiny"
                          icon={<RemoveIcon />}
                          ariaLabel="remove filter"
                          onClick={() => {
                            remove(index);
                          }}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Content>Remove filter</Tooltip.Content>
                    </Tooltip>
                  )}
                  <FilterRow index={index} id={field.id} fields={filterFields} control={control} setValue={setValue} />
                </FilterContainer>
              );
            })}
            <ButtonContainer justifyContent={fields.length > 0 ? 'space-between' : 'flex-end'}>
              {fields.length > 0 && (
                <Button type="button" variant="clear" text="Clear filters" onClick={handleClearFilters} />
              )}
              <FilterActions>
                <Button
                  onClick={() =>
                    append({
                      name: '',
                      operator: Operator.is,
                      value: '',
                      type: FilterInputType.string,
                    })
                  }
                  variant="clear"
                  text="Add filter"
                />
                <Button type="submit" text="Apply filters" />
              </FilterActions>
            </ButtonContainer>
            <DevTool control={control} />
          </StyledForm>
        </Container>
      </Popover.Content>
    </Popover>
  );
};
