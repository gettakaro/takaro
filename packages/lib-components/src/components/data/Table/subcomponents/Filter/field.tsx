import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { SelectField, TextField } from '../../../../../components';
import { Operators, FilterInputType, IFormInputs } from '.';
import { Column } from '@tanstack/react-table';
import { useLayoutEffect } from 'react';
import { camelCaseToSpaces } from '../../../../../helpers';

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
    switch (meta?.dataType) {
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
    const meta = column?.columnDef.meta;

    setValue(`filters.${index}.operator`, Operators.is);
    setValue(`filters.${index}.type`, (meta?.dataType as string | undefined as FilterInputType) ?? 'string');
  }, [currentColumn]);

  return (
    <>
      <SelectField
        key={`column-${id}`}
        control={control}
        name={`filters.${index}.column`}
        label="Column"
        render={(selectedItems) => {
          if (selectedItems.length === 0) {
            return 'Select a column';
          }
          const col = columnIds.find((col) => col === selectedItems[0].value);
          return camelCaseToSpaces(col);
        }}
      >
        <SelectField.OptionGroup>
          {columnIds.map((col) => (
            <SelectField.Option key={col} value={col} label={col}>
              <div>
                <span>{camelCaseToSpaces(col)}</span>
              </div>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>

      <SelectField
        key={`operator-${id}`}
        control={control}
        name={`filters.${index}.operator`}
        label="Condition"
        render={() => {
          const operator = currentOperator?.toString();

          if (operator === '') {
            return 'Select a condition';
          }

          return operator;
        }}
      >
        <SelectField.OptionGroup>
          {operators.map((operator) => (
            <SelectField.Option key={operator} value={operator} label={operator}>
              <div>
                <span>{operator}</span>
              </div>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>
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
