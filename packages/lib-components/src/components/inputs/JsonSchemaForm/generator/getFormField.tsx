import { Control } from 'react-hook-form';
import {
  CheckBox,
  Option,
  OptionGroup,
  Select,
  TextField,
  TagField,
} from '../../../../components';
import { Input, InputType } from './InputTypes';
import { FC } from 'react';

export const FormField: FC<{
  input: Input;
  control: Control<any>;
  index: number;
}> = ({ control, input, index }) => {
  const typeSpecificFields: JSX.Element[] = [];
  switch (input.type) {
    case InputType.string:
      typeSpecificFields.push(
        <TextField
          control={control}
          type="text"
          label="Default value"
          name={`configFields.${index}.default`}
        />
      );

      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Minimum length"
          name={`configFields.${index}.minLength`}
        />
      );
      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Maximum length"
          name={`configFields.${index}.maxLength`}
        />
      );
      break;
    case InputType.number:
      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Default value"
          name={`configFields.${index}.default`}
        />
      );
      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Minimum"
          name={`configFields.${index}.minimum`}
        />
      );
      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Maximum"
          name={`configFields.${index}.maximum`}
        />
      );
      break;
    case InputType.boolean:
      typeSpecificFields.push(
        <CheckBox
          control={control}
          label="Default value"
          labelPosition="left"
          name={`configFields.${index}.default`}
          description="If no value is given, what should the default be?"
        />
      );
      break;
    case InputType.enum:
      typeSpecificFields.push(
        <TagField
          control={control}
          name={`configFields.${index}.enum`}
          label="Possible values"
          isEditOnRemove
          placeholder="Press enter to add a value"
        />
      );
      break;
    case InputType.array:
      break;
    default:
      throw new Error(`Unknown input type: ${input}`);
  }

  return (
    <>
      <Select
        control={control}
        name={`configFields.${index}.type`}
        label="Type"
        render={(selectedIndex) => (
          <div>
            {selectedIndex !== -1
              ? Object.values(InputType)[selectedIndex]
              : Object.values(InputType)[0]}
          </div>
        )}
      >
        <OptionGroup label="type">
          {Object.values(InputType).map((type) => (
            <Option key={type} value={type}>
              <span>{type}</span>
            </Option>
          ))}
        </OptionGroup>
      </Select>
      <TextField
        control={control}
        label="Name"
        name={`configFields.${index}.name`}
      />
      <TextField
        control={control}
        label="Description"
        name={`configFields.${index}.description`}
      />
      {typeSpecificFields}

      <CheckBox
        control={control}
        label="Required"
        labelPosition="left"
        name={`configFields.${index}.required`}
        description="If this field is required to be filled out"
      />
    </>
  );
};
