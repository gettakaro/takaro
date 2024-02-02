import { Control } from 'react-hook-form';
import { InputType } from '../../schemaConversion/inputTypes';
import { TextField, TagField, SelectField, Switch, DurationField } from '@takaro/lib-components';
import { IFormInputs } from '..';
import { useWatch } from 'react-hook-form';
import { CountrySelect } from 'components/selects/CountrySelect';

export const InputTypeToConfigFieldMap = (control: Control<IFormInputs>, index: number, id: string) => {
  // In case of enum or array, we need the enum values to be able to set the default value
  const values = useWatch<IFormInputs>({
    name: `configFields.${index}.values`,
    control,
    defaultValue: [],
  }) as string[];

  const getName = (name: string) => {
    return `configFields.${index}.${name}`;
  };

  const multiple = useWatch<IFormInputs>({ name: `configFields.${index}.multiple`, control }) as boolean | undefined;
  const uniqueItems = useWatch<IFormInputs>({ name: `configFields.${index}.uniqueItems`, control }) as
    | boolean
    | undefined;

  return {
    [InputType.text]: [
      <TextField
        name={getName('default')}
        key={`${InputType.text}-default-${id}`}
        control={control}
        type="text"
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
      />,
      <TextField
        name={getName('minLength')}
        key={`${InputType.text}-minLength-${id}`}
        control={control}
        type="number"
        label="Minimum length"
        placeholder="0"
      />,
      <TextField
        name={getName('maxLength')}
        key={`${InputType.text}-maxLength-${id}`}
        control={control}
        type="number"
        placeholder="100"
        label="Maximum length"
      />,
    ],
    [InputType.number]: [
      <TextField
        name={getName('default')}
        key={`${InputType.number}-default-${id}`}
        control={control}
        type="number"
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
      />,
      <TextField
        name={getName('minimum')}
        key={`${InputType.number}-minimum-${id}`}
        control={control}
        type="number"
        label="Minimum"
      />,
      <TextField
        name={getName('maximum')}
        key={`${InputType.number}-maximum-${id}`}
        control={control}
        type="number"
        label="Maximum"
      />,
    ],
    [InputType.boolean]: [
      <Switch
        name={getName('default')}
        key={`${InputType.boolean}-default-${id}`}
        control={control}
        label="Default value"
        description="When a user installs the module, this will be the default value for this field."
      />,
    ],
    [InputType.array]: [
      <TagField
        name={getName('default')}
        key={`${InputType.array}-default-${id}`}
        control={control}
        label="Default values"
        isEditOnRemove
        allowDuplicates={!uniqueItems}
        description="When a user installs the module, A list of strings will be set with these values set by default. The user can add, remove and edit these values."
        placeholder="Press enter to add a value."
      />,
      <TextField
        name={getName('minItems')}
        key={`${InputType.array}-minItems-${id}`}
        control={control}
        type="number"
        label="Minimum items"
        description="Requires the user to add at least this number of items to the list."
      />,
      <TextField
        name={getName('maxItems')}
        key={`${InputType.array}-maxItems-${id}`}
        control={control}
        type="number"
        label="Maximum items"
        description="Limits the number of items the user can add to this list."
      />,
      <Switch
        name={getName('uniqueItems')}
        key={`${InputType.array}-uniqueItems-${id}`}
        control={control}
        label="Unique items"
        description="If you want to allow the user to add duplicate items to the list or not."
      />,
    ],
    [InputType.enumeration]: [
      <TagField
        name={getName('values')}
        key={`${InputType.enumeration}-enum-${id}`}
        control={control}
        label="Possible values"
        isEditOnRemove
        placeholder="Press enter to add a value."
      />,
      <Switch
        name={getName('multiple')}
        key={`${InputType.enumeration}-multiple-${id}`}
        control={control}
        label="Multiple"
        description="If you want to allow the user to select multiple items from the list."
      />,
      values.length > 0 && (
        <SelectField
          key={`${InputType.enumeration}-default-${id}`}
          control={control}
          name={getName('default')}
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
        name={getName('multiple')}
        control={control}
        label="Multiple items?"
        description="If you want to allow the user to select multiple items"
      />,
    ],
    [InputType.country]: [
      <Switch
        key={`${InputType.country}-multiple-${id}`}
        name={getName('multiple')}
        control={control}
        label="Multiple countries?"
        description="If you want to allow the user to select multiple countries"
      />,
      <CountrySelect
        name={getName('default')}
        key={`${InputType.country}-values-${id}`}
        label="Default selected"
        multiple={multiple ? true : false}
        control={control}
      />,
    ],
    [InputType.duration]: [
      <DurationField
        canClear
        name={getName('default')}
        key={`${InputType.duration}-default-${id}`}
        label="Default value"
        placeholder="Select default duration..."
        control={control}
      />,
    ],
  };
};
