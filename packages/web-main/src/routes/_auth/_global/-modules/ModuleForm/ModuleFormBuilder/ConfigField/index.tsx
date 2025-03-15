import { Control, UseFieldArrayRemove, UseFormResetField, useWatch } from 'react-hook-form';
import { SelectField, TextField, Chip, TextAreaField, IconButton, Tooltip, Switch } from '@takaro/lib-components';
import { Header, Inner } from './style';
import { IFormInputs } from '..';
import { AnyInput, InputType } from '../../../schemaConversion/inputTypes';
import { FC, useEffect, useState } from 'react';
import { AiOutlineDelete as RemoveIcon } from 'react-icons/ai';
import { InputTypeToConfigFieldMap } from './InputTypeToConfigFieldMap';
import { groupedByCategory } from './InputTypeByCategory';

interface ConfigFieldProps {
  input: AnyInput;
  control: Control<IFormInputs>;
  id: string;
  index: number;
  remove: UseFieldArrayRemove;
  resetField: UseFormResetField<IFormInputs>;
  readOnly: boolean;
}

export const ConfigField: FC<ConfigFieldProps> = ({ control, index, remove, id, resetField, readOnly }) => {
  const [initialised, setInitialised] = useState<boolean>(false);
  const output = useWatch<IFormInputs>({
    control,
    name: `configFields.${index}.name`,
  });

  const inputType = useWatch<IFormInputs>({
    control,
    name: `configFields.${index}.type`,
  }) as InputType;

  /* whenever the field type changes we swap all type dependent fields.
    `configFields.${index}.default` has the same name across different inputTypes.
    We need to reset the default value to the new type default value.
    because otherwise incorrect values are passed to fields that don't know how to handle them.
    Limitation: values cannot be reset to undefined. Resulting in potentially unwanted default values.
    source: https://github.com/orgs/react-hook-form/discussions/5858
  */
  useEffect(() => {
    if (inputType && initialised) {
      switch (inputType) {
        case InputType.text:
          resetField(`configFields.${index}.default`, {
            defaultValue: '',
          });
          break;
        case InputType.number:
        case InputType.duration:
          resetField(`configFields.${index}.default`, {
            defaultValue: 0,
          });
          break;
        case InputType.boolean:
          resetField(`configFields.${index}.default`, {
            defaultValue: false,
          });
          break;

        case InputType.item:
          resetField(`configFields.${index}.multiple`, {
            defaultValue: false,
          });
          break;
        case InputType.country:
          resetField(`configFields.${index}.multiple`, {
            defaultValue: false,
          });
          resetField(`configFields.${index}.default`, {
            defaultValue: '',
          });
          break;
        case InputType.enumeration:
          resetField(`configFields.${index}.multiple`, {
            defaultValue: false,
          });
          resetField(`configFields.${index}.default`, {
            defaultValue: '',
          });
          break;
        case InputType.array:
          resetField(`configFields.${index}.default`, {
            defaultValue: [],
          });
          break;
      }
    } else {
      setInitialised(true);
    }
  }, [inputType]);

  return (
    <>
      <Header>
        <div>
          <Chip color="primary" label={`Field ${index + 1}`} />
          <h3>{output as string}</h3>
        </div>
        {!readOnly && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <IconButton
                onClick={() => remove(index)}
                icon={<RemoveIcon cursor="pointer" size={18} />}
                ariaLabel="Remove field"
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Remove field</Tooltip.Content>
          </Tooltip>
        )}
      </Header>
      <TextField
        control={control}
        label="Name"
        name={`configFields.${index}.name`}
        readOnly={readOnly}
        required
        placeholder="Config field name"
        description="The name of the field. This will be shown to the user."
      />
      <TextAreaField
        control={control}
        label="Description"
        rows={8}
        readOnly={readOnly}
        name={`configFields.${index}.description`}
        placeholder="Enables you to ..."
        description="Describe what this field does. This will be shown to the user."
      />
      <SelectField
        control={control}
        name={`configFields.${index}.type`}
        readOnly={readOnly}
        label="Type"
        render={(selectedItems) => (
          <div>
            {selectedItems.length > 0
              ? Object.values(InputType).find((i) => i == selectedItems[0].value)
              : Object.values(InputType)[0]}
          </div>
        )}
      >
        {Object.entries(groupedByCategory).map(([category, infos]) => (
          <SelectField.OptionGroup key={category} label={category}>
            {infos.map(({ type, description }) => (
              <SelectField.Option key={`${type}-${id}`} value={type} label={type}>
                <Inner>
                  <span>{type}</span>
                  <p>{description}</p>
                </Inner>
              </SelectField.Option>
            ))}
          </SelectField.OptionGroup>
        ))}
      </SelectField>
      {InputTypeToConfigFieldMap(control, index, id, readOnly)[inputType]}
      {inputType !== InputType.boolean && (
        <Switch
          readOnly={readOnly}
          key={`configFields.${index}.required`}
          control={control}
          label="Is Field required?"
          name={`configFields.${index}.required`}
          description="Makes sure the field is not empty. E.g. if you are depending on this field in the module code."
        />
      )}
    </>
  );
};
