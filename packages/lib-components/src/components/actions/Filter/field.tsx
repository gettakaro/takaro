import { Control, useWatch } from 'react-hook-form';
import { SelectField, TextField } from '../../../components';
import { FilterField, FilterInputType, getOperatorLabel, IFormInputs } from '.';
import { Operator } from '.';
import { camelCaseToSpaces } from '../../../helpers';

interface FilterFieldProps {
  index: number;
  id: string;
  fields: string[];
  control: Control<IFormInputs>;
}

export function FilterRow({ id, fields, index, control }: FilterFieldProps) {
  const currentField = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.name`,
  });
  const currentOperator = useWatch<IFormInputs>({
    control,
    name: `filters.${index}.operator`,
  });
  const getOperators = (fieldName: string | undefined) => {
    const defaultOperators = [Operator.is, Operator.contains];

    if (!fieldName) {
      return defaultOperators;
    }

    const field: FilterField = {
      name: fieldName,
      type: FilterInputType.string,
    };
    if (!field) {
      return defaultOperators;
    }

    switch (field.type) {
      case FilterInputType.number:
      case FilterInputType.datetime:
        return [Operator.is];
      default:
        return defaultOperators;
    }
  };

  const operators = getOperators(currentField.toString());

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
          const field = fields.find((col) => col === selectedItems[0].value);
          return field;
        }}
      >
        <SelectField.OptionGroup>
          {fields.map((field) => (
            <SelectField.Option key={field} value={field} label={field}>
              <div>
                <span>{camelCaseToSpaces(field)}</span>
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
