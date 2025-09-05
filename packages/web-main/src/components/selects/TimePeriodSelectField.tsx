import { SelectField } from '@takaro/lib-components';
import { AnalyticsControllerGetShopAnalyticsPeriodEnum } from '@takaro/apiclient';
import { FC } from 'react';
import { CustomSelectProps } from '.';

interface TimeOption {
  label: string;
  value: AnalyticsControllerGetShopAnalyticsPeriodEnum;
}

const defaultOptions: TimeOption[] = [
  {
    label: 'Last 24 hours',
    value: AnalyticsControllerGetShopAnalyticsPeriodEnum.Last24Hours,
  },
  {
    label: 'Last 7 days',
    value: AnalyticsControllerGetShopAnalyticsPeriodEnum.Last7Days,
  },
  {
    label: 'Last 30 days',
    value: AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days,
  },
  {
    label: 'Last 90 days',
    value: AnalyticsControllerGetShopAnalyticsPeriodEnum.Last90Days,
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
