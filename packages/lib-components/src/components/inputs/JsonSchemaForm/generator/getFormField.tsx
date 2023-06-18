import {
  Control,
  UseFieldArrayRemove,
  UseFormResetField,
  useWatch,
} from 'react-hook-form';
import {
  CheckBox,
  Option,
  OptionGroup,
  Select,
  TextField,
  TagField,
  Chip,
} from '../../../../components';
import { IFormInputs } from '.';
import { Input, InputType } from './InputTypes';
import { FC, useEffect } from 'react';
import { styled } from '../../../../styled';
import { AiOutlineDelete as RemoveIcon } from 'react-icons/ai';

const Header = styled.div`
  margin: ${({ theme }) => `${theme.spacing[2]} 0 ${theme.spacing[1]} 0`};
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    h3 {
      text-transform: capitalize;
      margin-left: 5px;
    }
  }
`;

interface FormFieldProps {
  input: Input;
  control: Control<IFormInputs>;
  id: string;
  index: number;
  remove: UseFieldArrayRemove;
  resetField: UseFormResetField<IFormInputs>;
}

export const FormField: FC<FormFieldProps> = ({
  control,
  input,
  index,
  remove,
  id,
  resetField,
}) => {
  const output = useWatch<IFormInputs>({
    control,
    name: `configFields.${index}.name`,
  });

  const fieldType = useWatch<IFormInputs>({
    control,
    name: `configFields.${index}.type`,
  });

  // whenever the field type changes we reset all type dependent fields.
  // Because some of the fields have the same form name the default value is not reset.
  // which results in impossible default values for the new type.
  useEffect(() => {
    // TODO: resetField takes a default value, we could set this depending on the fieldType
    resetField(`configFields.${index}.default`, { defaultValue: '' });
  }, [fieldType]);

  const typeSpecificFields: JSX.Element[] = [];

  switch (fieldType) {
    case InputType.string:
      typeSpecificFields.push(
        <TextField
          key={`${input.type}-default-${id}`}
          control={control}
          type="text"
          label="Default value"
          name={`configFields.${index}.default`}
        />
      );
      typeSpecificFields.push(
        <TextField
          key={`${input.type}-minLength-${id}`}
          control={control}
          type="number"
          label="Minimum length"
          name={`configFields.${index}.minLength`}
        />
      );
      typeSpecificFields.push(
        <TextField
          key={`${input.type}-maxLength-${id}`}
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
          key={`${input.type}-default-${id}`}
          control={control}
          type="number"
          label="Default value"
          name={`configFields.${index}.default`}
        />
      );
      typeSpecificFields.push(
        <TextField
          key={`${input.type}-minimum-${id}`}
          control={control}
          type="number"
          label="Minimum"
          name={`configFields.${index}.minimum`}
        />
      );
      typeSpecificFields.push(
        <TextField
          key={`${input.type}-maximum-${id}`}
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
          key={`${input.type}-default-${id}`}
          control={control}
          labelPosition="left"
          label="Default value"
          name={`configFields.${index}.default`}
        />
      );
      break;
    case InputType.enum:
      typeSpecificFields.push(
        <TagField
          key={`${input.type}-enum-${id}`}
          control={control}
          name={`configFields.${index}.enum`}
          label="Possible values"
          isEditOnRemove
          placeholder="Press enter to add a value."
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
      <Header>
        <div>
          <Chip color="primary" label={`Field ${index + 1}`} />
          <h3>{output as string}</h3>
        </div>
        <RemoveIcon cursor="pointer" size={18} onClick={() => remove(index)} />
      </Header>
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
            <Option key={`${type}-${id}`} value={type}>
              <span>{type}</span>
            </Option>
          ))}
        </OptionGroup>
      </Select>
      {typeSpecificFields}
      <CheckBox
        control={control}
        label="Is Field required?"
        labelPosition="left"
        name={`configFields.${index}.required`}
      />
    </>
  );
};
