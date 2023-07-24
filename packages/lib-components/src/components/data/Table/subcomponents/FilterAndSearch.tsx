import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Column, Table } from '@tanstack/react-table';
import { Button, Divider, IconButton, Popover, Select, TextField, Tooltip } from '../../../../components';
import { styled } from '../../../../styled';
import { AiOutlineFilter as FilterIcon, AiOutlineClose as RemoveIcon } from 'react-icons/ai';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';

const FilterContainer = styled.div<{ hasMultipleFields: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasMultipleFields }) => (hasMultipleFields ? '20px 1fr 1fr 1fr' : '1fr 1fr 1fr')};
  gap: ${({ theme }) => theme.spacing['1_5']};
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

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

interface FilterAndSearchProps<DataType extends object> {
  columns: Column<DataType, unknown>[];
  table: Table<DataType>;
}

export function FilterAndSearch<DataType extends object>({ columns, table }: FilterAndSearchProps<DataType>) {
  const [open, setOpen] = useState<boolean>(false);

  // eslint-disable-next-line
  const columnIds = columns.map((column) => column.id) as any;

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

  const defaultColumnFilters = table
    .getState()
    .columnFilters.filter((filter) => Object.keys(filter).length)
    .map((filter) => {
      return {
        column: filter.id,
        operator: 'is',
        value: filter.value,
      };
    });

  const defaultGlobalFilters = table
    .getState()
    .globalFilter.filter((filter: { value: string; id: string }) => Object.keys(filter).length)
    .map((filter: { value: string; id: string }) => {
      return {
        column: filter.id,
        operator: 'contains',
        value: filter.value,
      };
    });

  const { control, handleSubmit } = useForm<IFormInputs>({
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

  const onSubmit: SubmitHandler<IFormInputs> = ({ filters }) => {
    // filters
    table.setColumnFilters(
      filters
        .filter((filter) => filter.operator === 'is')
        .map((filter) => {
          return {
            id: filter.column,
            value: filter.value,
          };
        })
    );

    // search
    table.setGlobalFilter(
      filters
        .filter((filter) => filter.operator === 'contains')
        .map((filter) => {
          return {
            id: filter.column,
            value: filter.value,
          };
        })
    );
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
                  <Tooltip>
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
                  control={control}
                  name={`filters.${index}.column`}
                  label="Column"
                  inPortal
                  render={(selectedIndex) => {
                    return columns[selectedIndex]?.id ?? 'Select a column';
                  }}
                >
                  <Select.OptionGroup>
                    {columns.map((col) => (
                      <Select.Option key={col.id} value={col.id}>
                        <div>
                          <span>{col.id}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select.OptionGroup>
                </Select>

                <Select
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
      </Popover.Content>
    </Popover>
  );
}
