import { SelectField } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';

interface TimeOption {
  label: string;
  value: string;
}

const defaultOptions: TimeOption[] = [
  {
    label: 'Last 24 hours',
    value: 'last24Hours',
  },
  {
    label: 'Last 7 days',
    value: 'last7Days',
  },
  {
    label: 'Last 30 days',
    value: 'last30Days',
  },
  {
    label: 'Last 90 days',
    value: 'last90Days',
  },
];

interface TimePeriodSelectProps extends CustomSelectProps {
  options?: TimeOption[];
}

export const TimePeriodSelectField: FC<TimePeriodSelectProps> = ({
  label = 'Time period',
  control,
  name,
  hint,
  size,
  loading,
  disabled,
  readOnly,
  required,
  description,
  options = defaultOptions,
}) => {
  return (
    <SelectField
      label={label}
      control={control}
      name={name}
      hint={hint}
      loading={loading}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      description={description}
      size={size}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        return <div>{selectedItems[0].label}</div>;
      }}
    >
      <SelectField.OptionGroup>
        {options.map(({ label, value }) => (
          <SelectField.Option key={value} value={value} label={label}>
            <div>
              <span>{label}</span>
            </div>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
