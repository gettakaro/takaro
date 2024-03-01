import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { SelectField, TextField } from '../../../components';
import { FilterField, FilterInputType, getOperatorLabel, IFormInputs } from '.';
import { Operator } from '.';
import { camelCaseToSpaces } from '../../../helpers';
import { useLayoutEffect } from 'react';

interface FilterFieldProps {
  index: number;
  id: string;
  fields: FilterField[];
  control: Control<IFormInputs>;
  setValue: UseFormSetValue<IFormInputs>;
}

export function FilterRow({ id, fields, index, control, setValue }: FilterFieldProps) {
  const currentField = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.name`,
  });
  const currentOperator = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.operator`,
  });
  const currentType = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.type`,
  });

  const operators = getOperators(currentType as FilterInputType);

  useLayoutEffect(() => {
    setValue(
      `filters.${index}.type`,
      fields.find((field) => field.name === currentField)?.type ?? FilterInputType.string
    );
  }, [currentField]);

  return (
    <>
      <SelectField
        key={`column-${id}`}
        control={control}
        name={`filters.${index}.name`}
        inPortal
        render={(selectedItems) => {
          if (selectedItems.length === 0) {
            return 'Select a column';
          }
          const field = fields.find((col) => col.name === selectedItems[0].value)?.name;

          return field;
        }}
      >
        <SelectField.OptionGroup>
          {fields.map((field) => (
            <SelectField.Option key={field.name} value={field.name} label={field.name}>
              <div>
                <span>{camelCaseToSpaces(field.name)}</span>
              </div>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>

      <SelectField
        key={`operator-${id}`}
        control={control}
        name={`filters.${index}.operator`}
        inPortal
        render={() => {
          const operator = currentOperator?.toString();

          if (operator === '') {
            return 'Select a condition';
          }

          return getOperatorLabel(operator as Operator);
        }}
      >
        <SelectField.OptionGroup>
          {operators.map((operator) => {
            return (
              <SelectField.Option key={operator} value={operator} label={operator}>
                <div>
                  <span>{getOperatorLabel(operator)}</span>
                </div>
              </SelectField.Option>
            );
          })}
        </SelectField.OptionGroup>
      </SelectField>
      <TextField key={`value-${id}`} control={control} name={`filters.${index}.value`} placeholder="Enter a value" />
    </>
  );
}
