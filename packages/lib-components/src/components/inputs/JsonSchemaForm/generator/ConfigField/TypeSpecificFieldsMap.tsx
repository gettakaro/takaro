import { Control, useWatch } from 'react-hook-form';
import { Input, InputType } from '../InputTypes';
import {
  TextField,
  TagField,
  CheckBox,
  Select,
} from '../../../../../components';
import { IFormInputs } from '..';

export const TypeSpecificFieldsMap = (
  control: Control<IFormInputs>,
  input: Input,
  index: number,
  id: string
) => {
  const enumValues = useWatch<IFormInputs>({
    name: `configFields.${index}.enum`,
    control,
  }) as string[];

  return {
    [InputType.string]: [
      <TextField
        name={`configFields.${index}.default`}
        key={`${input.type}-default-${id}`}
        control={control}
        type="text"
        label="Default value"
      />,
      <TextField
        name={`configFields.${index}.minLength`}
        key={`${input.type}-minLength-${id}`}
        control={control}
        type="number"
        label="Minimum length"
      />,
      <TextField
        name={`configFields.${index}.maxLength`}
        key={`${input.type}-maxLength-${id}`}
        control={control}
        type="number"
        label="Maximum length"
      />,
      <CheckBox
        key={`${input.type}-required-${id}`}
        control={control}
        label="Is Field required?"
        labelPosition="left"
        name={`configFields.${index}.required`}
      />,
    ],
    [InputType.number]: [
      <TextField
        name={`configFields.${index}.default`}
        key={`${input.type}-default-${id}`}
        control={control}
        type="number"
        label="Default value"
      />,
      <TextField
        name={`configFields.${index}.minimum`}
        key={`${input.type}-minimum-${id}`}
        control={control}
        type="number"
        label="Minimum"
      />,
      <TextField
        name={`configFields.${index}.maximum`}
        key={`${input.type}-maximum-${id}`}
        control={control}
        type="number"
        label="Maximum"
      />,
      <CheckBox
        key={`${input.type}-required-${id}`}
        control={control}
        label="Is Field required?"
        labelPosition="left"
        name={`configFields.${index}.required`}
      />,
    ],
    [InputType.boolean]: [
      <CheckBox
        name={`configFields.${index}.default`}
        key={`${input.type}-default-${id}`}
        control={control}
        labelPosition="left"
        label="Default value"
      />,
    ],
    [InputType.enum]: [
      <TagField
        name={`configFields.${index}.enum`}
        key={`${input.type}-enum-${id}`}
        control={control}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      enumValues && (
        <Select
          key={`${input.type}-default-${id}`}
          control={control}
          name={`configFields.${index}.default`}
          label="Default value"
          render={(selectedIndex) => (
            <div>
              {selectedIndex !== -1 ? enumValues[selectedIndex] : enumValues[0]}
            </div>
          )}
        >
          <Select.OptionGroup>
            {enumValues.map((enumValue: string) => (
              <Select.Option key={`${enumValue}-${id}`} value={enumValue}>
                <span>{enumValue}</span>
              </Select.Option>
            ))}
          </Select.OptionGroup>
        </Select>
      ),
    ],
    [InputType.array]: [
      <TagField
        name={`configFields.${index}.default`}
        key={`${input.type}-default-${id}`}
        control={control}
        label="Default value"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      <CheckBox
        key={`${input.type}-required-${id}`}
        control={control}
        label="Is Field required?"
        labelPosition="left"
        name={`configFields.${index}.required`}
      />,
    ],
  };
};
