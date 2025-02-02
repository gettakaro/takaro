import { AlertVariants, Color } from '@takaro/lib-components';
import { Usage, UsageProps } from '@takaro/lib-components/src/components/other/Usage/Usage';
import { FC } from 'react';

interface MaxUsageProps extends UsageProps {
  maxColor?: Color | AlertVariants;
}

export const MaxUsage: FC<MaxUsageProps> = ({ value, total, unit, color = 'primary' }) => {
  const percentage = value / total;
  function getColor(): Color | AlertVariants {
    if (percentage > 0.75 && percentage < 1) {
      return 'warning';
    } else if (percentage >= 1) {
      return 'error';
    } else {
      return color;
    }
  }

  return <Usage value={value} total={total} unit={unit} color={getColor()} minFill={5} />;
};
