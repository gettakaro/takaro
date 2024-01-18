import { Control } from 'react-hook-form';
import { InputType } from 'components/JsonSchemaForm/generator/inputTypes';
import { TextField, TagField, CheckBox, SelectField, Switch } from '@takaro/lib-components';
import { IFormInputs } from '..';
import { useWatch } from 'react-hook-form';

export const InputTypeToFieldsMap = (control: Control<IFormInputs>, index: number, id: string) => {
  // In case of enum or array, we need the enum values to be able to set the default value
  const enumValues = useWatch<IFormInputs>({
    name: `configFields.${index}.values`,
    control,
    defaultValue: [],
  }) as string[];

  return {
    [InputType.string]: [
      <TextField
        name={`configFields.${index}.default`}
        key={`${InputType.string}-default-${id}`}
        control={control}
        type="text"
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
      />,
      <TextField
        name={`configFields.${index}.minLength`}
        key={`${InputType.string}-minLength-${id}`}
        control={control}
        type="number"
        label="Minimum length"
        placeholder="0"
      />,
      <TextField
        name={`configFields.${index}.maxLength`}
        key={`${InputType.string}-maxLength-${id}`}
        control={control}
        type="number"
        placeholder="100"
        label="Maximum length"
      />,
    ],
    [InputType.number]: [
      <TextField
        name={`configFields.${index}.default`}
        key={`${InputType.number}-default-${id}`}
        control={control}
        type="number"
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
      />,
      <TextField
        name={`configFields.${index}.minimum`}
        key={`${InputType.number}-minimum-${id}`}
        control={control}
        type="number"
        label="Minimum"
      />,
      <TextField
        name={`configFields.${index}.maximum`}
        key={`${InputType.number}-maximum-${id}`}
        control={control}
        type="number"
        label="Maximum"
      />,
    ],
    [InputType.boolean]: [
      <CheckBox
        name={`configFields.${index}.default`}
        key={`${InputType.boolean}-default-${id}`}
        control={control}
        labelPosition="left"
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
      />,
    ],
    [InputType.enum]: [
      <TagField
        name={`configFields.${index}.values`}
        key={`${InputType.enum}-enum-${id}`}
        control={control}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      enumValues.length > 0 && (
        <SelectField
          key={`${InputType.enum}-default-${id}`}
          control={control}
          name={`configFields.${index}.default`}
          label="default value"
          render={(selectedItems) => {
            if (selectedItems.length === 0) {
              return <div>Select default value...</div>;
            }
            return <div>{selectedItems[0].label}</div>;
          }}
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
    [InputType.item]: [
      <Switch
        key={`${InputType.enum}-multiple-${id}`}
        name={`configFields.${index}.multiple`}
        control={control}
        label="Multiple items?"
        description="If you want to allow the user to select multiple items"
      />,
    ],
    [InputType.array]: [
      <TagField
        name={`configFields.${index}.values`}
        key={`${InputType.enum}-enum-${id}`}
        control={control}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      enumValues.length > 0 && (
        <SelectField
          key={`${InputType.array}-default-${id}`}
          control={control}
          name={`configFields.${index}.default`}
          multiple={true}
          label={'Default values'}
          render={(selectedItems) => {
            if (selectedItems.length === 0) {
              return <div>Select default values...</div>;
            }
            return <div>{selectedItems.map((item) => item.label).join(', ')}</div>;
          }}
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
