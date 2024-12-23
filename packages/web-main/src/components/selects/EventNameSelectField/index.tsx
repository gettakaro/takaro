import { FC } from 'react';
import { CustomSelectProps } from '..';
import { SelectField } from '@takaro/lib-components';
import { categorizedEventNames } from './eventNames';

export type EvenntNameSelectProps = CustomSelectProps;

function cleanEventName(eventName: string) {
  return eventName.replaceAll('-', ' ').toLowerCase();
}

export const EventNameSelectField: FC<CustomSelectProps> = ({
  control,
  name: selectName,
  loading,
  description,
  readOnly,
  disabled,
  size,
  hint,
  required,
  multiple,
  label = 'Event Name',
  canClear,
}) => {
  return (
    <SelectField
      label={label}
      control={control}
      name={selectName}
      hint={hint}
      canClear={canClear}
      multiple={multiple}
      enableFilter
      loading={loading}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      description={description}
      size={size}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>select event...</div>;
        }
        return <div>{multiple ? selectedItems.map((item) => item.label).join(', ') : selectedItems[0].label}</div>;
      }}
    >
      {categorizedEventNames.map(({ events, category }) => (
        <SelectField.OptionGroup label={category} key={`${selectName}-${category}`}>
          {events.map((eventName: string) => (
            <SelectField.Option key={`${selectName}-${eventName}`} value={eventName} label={cleanEventName(eventName)}>
              {cleanEventName(eventName)}
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      ))}
    </SelectField>
  );
};
