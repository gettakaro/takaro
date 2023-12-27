import { Select } from '@takaro/lib-components';
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

export const TimePeriodSelect: FC<TimePeriodSelectProps> = ({
  label = 'Time period',
  control,
  name,
  hint,
  size,
  loading,
  disabled,
  inPortal,
  readOnly,
  required,
  description,
  options = defaultOptions,
}) => {
  return (
    <Select
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
      inPortal={inPortal}
      render={(selectedIndex) => <div>{options[selectedIndex]?.label ?? selectedIndex}</div>}
    >
      {options.map(({ label, value }) => (
        <Select.OptionGroup>
          <Select.Option key={value} value={value}>
            <div>
              <span>{label}</span>
            </div>
          </Select.Option>
        </Select.OptionGroup>
      ))}
    </Select>
  );
};
