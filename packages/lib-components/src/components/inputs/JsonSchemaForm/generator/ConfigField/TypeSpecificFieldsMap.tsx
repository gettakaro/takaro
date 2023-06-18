import { Control } from 'react-hook-form';
import { Input, InputType } from '../InputTypes';
import { TextField, TagField, CheckBox } from '../../../../../components';

export const TypeSpecificFieldsMap = (
  control: Control<any>,
  input: Input,
  index: number,
  id: string
) => {
  return {
    [InputType.string]: [
      <TextField
        key={`${input.type}-default-${id}`}
        control={control}
        type="text"
        label="Default value"
        name={`configFields.${index}.default`}
      />,
      <TextField
        key={`${input.type}-minLength-${id}`}
        control={control}
        type="number"
        label="Minimum length"
        name={`configFields.${index}.minLength`}
      />,
      <TextField
        key={`${input.type}-maxLength-${id}`}
        control={control}
        type="number"
        label="Maximum length"
        name={`configFields.${index}.maxLength`}
      />,
    ],
    [InputType.number]: [
      <TextField
        key={`${input.type}-default-${id}`}
        control={control}
        type="number"
        label="Default value"
        name={`configFields.${index}.default`}
      />,
      <TextField
        key={`${input.type}-minimum-${id}`}
        control={control}
        type="number"
        label="Minimum"
        name={`configFields.${index}.minimum`}
      />,
      <TextField
        key={`${input.type}-maximum-${id}`}
        control={control}
        type="number"
        label="Maximum"
        name={`configFields.${index}.maximum`}
      />,
    ],
    [InputType.boolean]: [
      <CheckBox
        key={`${input.type}-default-${id}`}
        control={control}
        labelPosition="left"
        label="Default value"
        name={`configFields.${index}.default`}
      />,
    ],
    [InputType.enum]: [
      <TagField
        key={`${input.type}-enum-${id}`}
        control={control}
        name={`configFields.${index}.enum`}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
    ],
    [InputType.array]: [],
  };
};
