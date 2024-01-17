import { Control } from 'react-hook-form';
import { Input, InputType, SubType } from '../inputTypes';
import { TextField, TagField, CheckBox, SelectField } from '@takaro/lib-components';
import { IFormInputs } from '..';
import { useWatch } from 'react-hook-form';

export const SubTypeToFieldsMap = (
  control: Control<IFormInputs>,
  input: Input,
  index: number,
  id: string,
  enumValues: string[]
) => {
  return {
    [SubType.item]: [
      /* We cannot ask to set default value(s) since when the module is written the game is unknown */
      /* We could potentially let the user set default values per game, but that seems a bit weird */
    ],
    [SubType.custom]: [
      <TagField
        name={`configFields.${index}.values`}
        key={`${input.type}-enum-${id}`}
        control={control}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      enumValues && (
        <SelectField
          key={`${input.type}-default-${id}`}
          control={control}
          name={`configFields.${index}.default`}
          label="Default value"
          render={(selectedItems) => (
            <div>{selectedItems.length > 0 ? enumValues.find((e) => e === selectedItems[0].value) : enumValues[0]}</div>
          )}
        >
          <SelectField.OptionGroup>
            {enumValues.map((enumValue: string) => (
              <SelectField.Option key={`${enumValue}-${id}`} value={enumValue} label={enumValue}>
                <span>{enumValue}</span>
              </SelectField.Option>
            ))}
          </SelectField.OptionGroup>
        </SelectField>
      ),
    ],
  };
};

export const InputTypeToFieldsMap = (control: Control<IFormInputs>, input: Input, index: number, id: string) => {
  const selectedSubType = useWatch<IFormInputs>({
    name: `configFields.${index}.subType`,
    control,
  }) as SubType;

  // In case selectSubType is `custom`, we need to pass the enum values to the SubTypeToFieldsMap
  const enumValues = useWatch<IFormInputs>({
    name: `configFields.${index}.values`,
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
        description="When a user installs the module, this will be the default value for this field."
      />,
      <TextField
        name={`configFields.${index}.minLength`}
        key={`${input.type}-minLength-${id}`}
        control={control}
        type="number"
        label="Minimum length"
        placeholder="0"
      />,
      <TextField
        name={`configFields.${index}.maxLength`}
        key={`${input.type}-maxLength-${id}`}
        control={control}
        type="number"
        placeholder="100"
        label="Maximum length"
      />,
      <CheckBox
        key={`${input.type}-required-${id}`}
        control={control}
        label="Is Field required?"
        labelPosition="left"
        name={`configFields.${index}.required`}
        description="Makes sure the field is not empty. E.g. if you are depending on this field in the module code."
      />,
    ],
    [InputType.number]: [
      <TextField
        name={`configFields.${index}.default`}
        key={`${input.type}-default-${id}`}
        control={control}
        type="number"
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
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
        description="When a user installs the module, this will be the default value for this field."
      />,
    ],
    [InputType.enum]: [
      <SelectField
        name={`configFields.${index}.subType`}
        key={`${input.type}-subType-${id}`}
        control={control}
        label="Subtype"
        render={(selectedItems) => <div>{selectedItems.length > 0 ? selectedItems[0].value : 'Select a subtype'}</div>}
      >
        <SelectField.OptionGroup>
          {Object.keys(SubType).map((subType: string) => (
            <SelectField.Option key={`${subType}-${id}`} value={subType} label={subType}>
              <span>{subType}</span>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>,
      selectedSubType && SubTypeToFieldsMap(control, input, index, id, enumValues)[selectedSubType],
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
        description="Makes sure the field is not empty. E.g. if you are depending on this field in the module code."
      />,
    ],
  };
};
