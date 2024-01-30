import { Control } from 'react-hook-form';
import { InputType } from '../../schemaConversion/inputTypes';
import { TextField, TagField, CheckBox, SelectField, Switch, DurationField } from '@takaro/lib-components';
import { IFormInputs } from '..';
import { useWatch } from 'react-hook-form';
import { CountrySelect } from 'components/selects/CountrySelect';

export const InputTypeToFieldsMap = (control: Control<IFormInputs>, index: number, id: string) => {
  // In case of enum or array, we need the enum values to be able to set the default value
  const values = useWatch<IFormInputs>({
    name: `configFields.${index}.values`,
    control,
    defaultValue: [],
  }) as string[];

  const multiple = useWatch<IFormInputs>({ name: `configFields.${index}.multiple`, control }) as boolean | undefined;

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
    [InputType.array]: [
      <TagField
        name={`configFields.${index}.default`}
        key={`${InputType.array}-default-${id}`}
        control={control}
        label="Default values"
        isEditOnRemove
        description="When a user installs the module, A list of strings will be set with these values set by default. The user can add, remove and edit these values."
        placeholder="Press enter to add a value."
      />,
      <TextField
        name={`configFields.${index}.minItems`}
        key={`${InputType.array}-minItems-${id}`}
        control={control}
        type="number"
        label="Minimum items"
        description="Requires the user to add at least this number of items to the list."
      />,
      <TextField
        name={`configFields.${index}.maxItems`}
        key={`${InputType.array}-maxItems-${id}`}
        control={control}
        type="number"
        label="Maximum items"
        description="Limits the number of items the user can add to this list."
      />,
      <Switch
        name={`configFields.${index}.uniqueItems`}
        key={`${InputType.array}-uniqueItems-${id}`}
        control={control}
        label="Unique items"
        description="If you want to allow the user to add duplicate items to the list or not."
      />,
    ],
    [InputType.select]: [
      <TagField
        name={`configFields.${index}.values`}
        key={`${InputType.select}-enum-${id}`}
        control={control}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      <Switch
        name={`configFields.${index}.multiple`}
        key={`${InputType.select}-multiple-${id}`}
        control={control}
        label="Multiple"
        description="If you want to allow the user to select multiple items from the list."
      />,
      values.length > 0 && (
        <SelectField
          key={`${InputType.select}-default-${id}`}
          control={control}
          name={`configFields.${index}.default`}
          label="default value"
          canClear={true}
          multiple={multiple ? true : false}
          render={(selectedItems) => {
            if (selectedItems.length === 0) {
              return <div>{multiple ? 'Select default values...' : 'Select default value...'}</div>;
            }
            return <div>{multiple ? selectedItems.map((item) => item.label).join(', ') : selectedItems[0].label}</div>;
          }}
        >
          <SelectField.OptionGroup>
            {values.map((enumValue: string) => (
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
        key={`${InputType.item}-multiple-${id}`}
        name={`configFields.${index}.multiple`}
        control={control}
        label="Multiple items?"
        description="If you want to allow the user to select multiple items"
      />,
    ],
    [InputType.country]: [
      <Switch
        key={`${InputType.country}-multiple-${id}`}
        name={`configFields.${index}.multiple`}
        control={control}
        label="Multiple countries?"
        description="If you want to allow the user to select multiple countries"
      />,
      <CountrySelect
        name={`configFields.${index}.default`}
        label="Default selected"
        key={`${InputType.country}-values-${id}`}
        multiple={multiple ? true : false}
        control={control}
      />,
    ],
    [InputType.duration]: [
      <DurationField
        key={`${InputType.duration}-default-${id}`}
        name={`configFields.${index}.default`}
        label="Default value"
        placeholder="Select default duration..."
        control={control}
      />,
    ],
  };
};
