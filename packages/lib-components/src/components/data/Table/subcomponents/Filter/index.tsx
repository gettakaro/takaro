import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Table } from '@tanstack/react-table';
import { Button, Divider, IconButton, Popover, Select, TextField, Tooltip } from '../../../../../components';
import { AiOutlineFilter as FilterIcon, AiOutlineClose as RemoveIcon } from 'react-icons/ai';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Wrapper, ButtonContainer, FilterContainer } from './style';
import { useTableSearchParamKeys } from '../../SearchParams';
import { useSearchParams } from 'react-router-dom';

enum operators {
  is = 'is',
  contains = 'contains',
}

interface IFormInputs {
  filters: {
    column: string;
    operator: string;
    value: string;
  }[];
}

interface FilterProps<DataType extends object> {
  table: Table<DataType>;
  tableId: string;
}

export function Filter<DataType extends object>({ table, tableId }: FilterProps<DataType>) {
  const [open, setOpen] = useState<boolean>(false);
  const tableSearchParamKeys = useTableSearchParamKeys(tableId);
  const [_searchParams, setSearchParams] = useSearchParams();

  // Only get the columnIds on initial render
  const columnIds = useMemo(() => {
    return table
      .getAllLeafColumns()
      .filter((column) => column.getCanFilter() && column.getCanGlobalFilter())
      .map((column) => column.id);
  }, []);

  const validationSchema = useMemo(() => {
    return z.object({
      filters: z.array(
        z.object({
          column: z.string().refine((value) => columnIds.includes(value), {
            message: 'Please select a valid column.',
          }),
          operator: z.nativeEnum(operators, {
            errorMap: () => {
              return {
                message: 'Condition is required.',
              };
            },
          }),
          value: z.string().nonempty('Value cannot be empty.'),
        })
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
        operator: operators.is,
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
        operator: operators.contains,
        value: [...value],
      };
    });

  const { control, handleSubmit } = useForm<IFormInputs>({
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
    setSearchParams((prevSearchParams) => {
      prevSearchParams.delete(tableSearchParamKeys.COLUMN_SEARCH);
      prevSearchParams.delete(tableSearchParamKeys.COLUMN_FILTER);
      return prevSearchParams;
    });

    remove();
    append({
      column: '',
      operator: '',
      value: '',
    });
  }, [remove]);

  useEffect(() => {
    if (fields.length === 0) {
      append({
        column: '',
        operator: '',
        value: '',
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
    setOpen(false);
  };

  const filterCount = table.getState().columnFilters.length + table.getState().globalFilter.length;

  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom-end">
      <Popover.Trigger asChild>
        <Button
          icon={<FilterIcon />}
          text={`filter ${filterCount > 0 ? `(${filterCount})` : ''}`}
          onClick={() => setOpen(true)}
        />
      </Popover.Trigger>
      <Popover.Content>
        <Wrapper>
          <Button
            onClick={() =>
              append({
                column: '',
                operator: '',
                value: '',
              })
            }
            variant="clear"
            text="Add condition to filter by"
          />
          <Divider fullWidth />
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
                  <Select
                    key={`column-${field.id}`}
                    control={control}
                    name={`filters.${index}.column`}
                    label="Column"
                    inPortal
                    render={(selectedIndex) => {
                      return columnIds[selectedIndex] ?? 'Select a column';
                    }}
                  >
                    <Select.OptionGroup>
                      {columnIds.map((col) => (
                        <Select.Option key={col} value={col}>
                          <div>
                            <span>{col}</span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select.OptionGroup>
                  </Select>

                  <Select
                    key={`operator-${field.id}`}
                    control={control}
                    name={`filters.${index}.operator`}
                    label="Condition"
                    inPortal
                    render={(selectedIndex) => {
                      return Object.keys(operators)[selectedIndex] ?? 'select a condition';
                    }}
                  >
                    <Select.OptionGroup>
                      {Object.keys(operators).map((operator) => (
                        <Select.Option key={operator} value={operator}>
                          <div>
                            <span>{operator}</span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select.OptionGroup>
                  </Select>
                  <TextField
                    key={`value-${field.id}`}
                    control={control}
                    name={`filters.${index}.value`}
                    label="Value"
                    placeholder="Enter a value"
                  />
                </FilterContainer>
              );
            })}

            <ButtonContainer>
              {fields.length > 0 && (
                <Button type="button" variant="clear" text="Clear filters" onClick={handleClearFilters} />
              )}

              <Button type="submit" text="Apply filters" />
            </ButtonContainer>
          </form>
          {/* dropdown with all columns */}
          {/* dropdown with all operators */}
          {/* input for value */}
          {/* when all fields are valid, considered a filter */}
        </Wrapper>
      </Popover.Content>
    </Popover>
  );
}
