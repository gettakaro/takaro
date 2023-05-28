import {
  SubmitHandler,
  useForm,
  useFieldArray,
  Control,
} from 'react-hook-form';
import {
  Checkbox,
  Option,
  OptionGroup,
  Select,
  TextField,
} from '@takaro/lib-components';
import { Input, InputType } from './jsonSchemaGenerator';
import { FC, useState } from 'react';

export const FormField: FC<{ input: Input; control: Control<any> }> = ({
  control,
  input,
}) => {
  const [type, setType] = useState<InputType>(input.type);

  const typeSpecificFields: JSX.Element[] = [];

  switch (type) {
    case InputType.string:
      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Minimum length"
          name={`configFields.${input.name}.minLength`}
        />
      );
      typeSpecificFields.push(
        <TextField
          control={control}
          type="number"
          label="Maximum length"
          name={`configFields.${input.name}.maxLength`}
        />
      );
      break;

    default:
      throw new Error(`Unknown input type: ${input.type}`);
      break;
  }

  return (
    <>
      <Select
        control={control}
        name={`configFields.${input.name}.type`}
        label="Type"
        render={(selectedIndex) => <div>{type ?? 'Select...'}</div>}
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
        name={`configFields.${input.name}.name`}
      />
      <TextField
        control={control}
        label="Description"
        name={`configFields.${input.name}.description`}
      />
      <Checkbox
        control={control}
        label="Required"
        labelPosition="left"
        name={`configFields.${input.name}.required`}
        description="If this field is required to be filled out"
      />
      {typeSpecificFields}
    </>
  );
};
