import { AlertVariants, Color } from '../../../styled';
import { ProgressBar } from '../../../components';
import { FC } from 'react';

export interface UsageProps {
  unit?: string;
  value: number;
  total: number;
  color?: Color | AlertVariants;
  minFill?: number;
}

export const Usage: FC<UsageProps> = ({ value, total, unit, color = 'primary', minFill }) => {
  const percentage = (value / total) * 100;

  return (
    <div style={{ minWidth: '175px' }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingRight: '0.25rem',
        }}
      >
        <p>{unit}</p>
        <p>
          {value} of {total}
        </p>
      </div>
      <ProgressBar mode="determinate" value={percentage} size="small" color={color} minFill={minFill} />
    </div>
  );
};
