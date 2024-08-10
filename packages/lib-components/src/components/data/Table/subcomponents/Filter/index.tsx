import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Table } from '@tanstack/react-table';
import { Button, IconButton, Popover, Tooltip } from '../../../../../components';
import { AiOutlineFilter as FilterIcon, AiOutlineClose as RemoveIcon } from 'react-icons/ai';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonContainer, Container, FilterActions, FilterContainer } from './style';
import { FilterRow } from './field';

export enum Operators {
  is = 'is',
  contains = 'contains',
}

export enum FilterInputType {
  string = 'string',
  uuid = 'uuid',
  datetime = 'datetime',
}

export interface IFormInputs {
  filters: {
    column: string;
    operator: string;
    value: string;
    type: FilterInputType;
  }[];
}

interface FilterProps<DataType extends object> {
  table: Table<DataType>;
}

export function Filter<DataType extends object>({ table }: FilterProps<DataType>) {
  const [open, setOpen] = useState<boolean>(false);

  // Only get the columnIds on initial table render
  const columnIds = useMemo(() => {
    const ids = table
      .getAllColumns()
      .filter((column) => {
        return column.getCanFilter();
      })
      .map((column) => column.id);

    return ids;
  }, [table.getAllColumns()]);

  const basedShape = z.object({
    column: z.string().refine((value) => columnIds.includes(value), {
      message: 'Please select a valid column.',
    }),
    operator: z.nativeEnum(Operators, {
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
              value: z.string().min(1),
            }),
            z.object({
              type: z.literal(FilterInputType.uuid),
              value: z.string().uuid().min(1),
            }),
            z.object({
              type: z.literal(FilterInputType.datetime),
              value: z.string().datetime().min(1),
            }),
          ])
          .and(basedShape),
      ),
    });
  }, [columnIds]);

  // these are the filters that are already applied to the table
  const defaultColumnFilters = table
    .getState()
    .columnFilters.filter((filter) => Object.keys(filter).length)
    .map(({ id, value }) => {
      return {
        column: id,
        operator: Operators.is,
        value: [...(value as string[])],
      };
    });

  // these are the global filters (search in api) that are already applied to the table
  const defaultGlobalFilters = table
    .getState()
    .globalFilter.filter((filter: { value: string; id: string }) => Object.keys(filter).length)
    .map(({ value, id }: { value: string[]; id: string }) => {
      return {
        column: id,
        operator: Operators.contains,
        value: [...value],
      };
    });

  const { control, handleSubmit, setValue } = useForm<IFormInputs>({
    mode: 'onSubmit',

    resolver: zodResolver(validationSchema),
    defaultValues: {
      filters: [...defaultColumnFilters, ...defaultGlobalFilters],
    },
  });

  const { append, fields, remove } = useFieldArray({ name: 'filters', control });

  const handleClearFilters = useCallback(() => {
    table.resetColumnFilters();
    table.resetGlobalFilter();
    remove();
    append({
      column: '',
      operator: '',
      value: '',
      type: FilterInputType.string,
    });
  }, [remove]);

  useEffect(() => {
    if (fields.length === 0) {
      append({
        column: '',
        operator: '',
        value: '',
        type: FilterInputType.string,
      });
    }
  }, [fields]);

  // filters contains both column filters and global filters
  const onSubmit: SubmitHandler<IFormInputs> = ({ filters }) => {
    const columnFilters: Record<string, string[]> = {};
    const globalFilters: Record<string, string[]> = {};

    filters.forEach((filter) => {
      const target = filter.operator === 'is' ? columnFilters : globalFilters;
      if (!target[filter.column]) {
        target[filter.column] = [];
      }
      target[filter.column].push(filter.value);
    });

    const columnFiltersArray = Object.entries(columnFilters).map(([id, values]) => ({ id, value: values }));
    const globalFiltersArray = Object.entries(globalFilters).map(([id, values]) => ({ id, value: values }));

    table.setColumnFilters(columnFiltersArray);
    table.setGlobalFilter(globalFiltersArray);
    table.resetPagination();

    setOpen(false);
  };

  // const filterCount = table.getState().columnFilters.length + table.getState().globalFilter.length;

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger asChild>
        <IconButton icon={<FilterIcon />} onClick={() => setOpen(!open)} size="large" ariaLabel="filter" />
      </Popover.Trigger>
      <Popover.Content>
        <Container>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  <FilterRow
                    index={index}
                    id={field.id}
                    columnIds={columnIds}
                    control={control}
                    setValue={setValue}
                    getColumn={table.getColumn}
                  />
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
                      column: '',
                      operator: '',
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
          </form>
          {/* dropdown with all columns */}
          {/* dropdown with all operators */}
          {/* input for value */}
          {/* when all fields are valid, considered a filter */}
        </Container>
      </Popover.Content>
    </Popover>
  );
}
