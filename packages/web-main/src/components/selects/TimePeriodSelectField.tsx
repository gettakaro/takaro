import { SelectField } from '@takaro/lib-components';
import { ShopAnalyticsPeriod } from '@takaro/apiclient';
import { FC } from 'react';
import { CustomSelectProps } from '.';

interface TimeOption {
  label: string;
  value: ShopAnalyticsPeriod;
}

const defaultOptions: TimeOption[] = [
  {
    label: 'Last 24 hours',
    value: ShopAnalyticsPeriod.LAST_24_HOURS,
  },
  {
    label: 'Last 7 days',
    value: ShopAnalyticsPeriod.LAST_7_DAYS,
  },
  {
    label: 'Last 30 days',
    value: ShopAnalyticsPeriod.LAST_30_DAYS,
  },
  {
    label: 'Last 90 days',
    value: ShopAnalyticsPeriod.LAST_90_DAYS,
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
