import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { Select, TextField } from '../../../../../components';
import { IFormInputs } from '.';
import { Operators } from '.';
import { Column } from '@tanstack/react-table';
import { useLayoutEffect } from 'react';

interface FilterFieldProps<DataType> {
  index: number;
  id: string;
  columnIds: string[];
  control: Control<IFormInputs>;
  getColumn: (columnId: string) => Column<DataType, unknown> | undefined;
  setValue: UseFormSetValue<IFormInputs>;
}

export function FilterRow<DataType extends object>({
  id,
  columnIds,
  index,
  control,
  setValue,
  getColumn,
}: FilterFieldProps<DataType>) {
  const currentColumn = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.column`,
  });
  const currentOperator = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.operator`,
  });

  const getOperators = (columnId: string | undefined) => {
    const defaultOperators = [Operators.is, Operators.contains];

    if (!columnId) {
      return defaultOperators;
    }

    const column = getColumn(columnId);
    if (!column) {
      return defaultOperators;
    }

    const meta = column?.columnDef?.meta as Record<string, unknown> | undefined;
    switch (meta?.type) {
      case 'uuid':
      case 'datetime':
        return [Operators.is];
      default:
        return defaultOperators;
    }
  };

  const operators = getOperators(currentColumn.toString());

  useLayoutEffect(() => {
    const column = getColumn(currentColumn.toString());
    const meta = column?.columnDef?.meta as Record<string, unknown> | undefined;

    setValue(`filters.${index}.operator`, Operators.is);
    setValue(`filters.${index}.type`, (meta?.type as string | undefined) ?? 'string');
  }, [currentColumn]);

  return (
    <>
      <Select
        key={`column-${id}`}
        control={control}
        name={`filters.${index}.column`}
        label="Column"
        inPortal
        render={() => {
          const col = currentColumn.toString();

          if (col === '') {
            return 'Select a column';
          }

          return col;
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
        key={`operator-${id}`}
        control={control}
        name={`filters.${index}.operator`}
        label="Condition"
        inPortal
        render={() => {
          const operator = currentOperator?.toString();

          if (operator === '') {
            return 'Select a condition';
          }

          return operator;
        }}
      >
        <Select.OptionGroup>
          {operators.map((operator) => (
            <Select.Option key={operator} value={operator}>
              <div>
                <span>{operator}</span>
              </div>
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>
      <TextField
        key={`value-${id}`}
        control={control}
        name={`filters.${index}.value`}
        label="Value"
        placeholder="Enter a value"
      />
    </>
  );
}
