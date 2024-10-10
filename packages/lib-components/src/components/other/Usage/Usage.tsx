import { ProgressBar } from '../../../components';
import { FC } from 'react';

export interface UsageProps {
  unit?: string;
  value: number;
  total: number;
}

export const Usage: FC<UsageProps> = ({ value, total, unit }) => {
  const percentage = (value / total) * 100;

  return (
    <div>
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
          {value}/{total}
        </p>
      </div>
      <ProgressBar mode="determinate" value={percentage} size="small" />
    </div>
  );
};
