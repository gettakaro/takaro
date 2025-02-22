import { AlertVariants, Color, UsageCard, UsageCardProps } from '@takaro/lib-components';
import { FC } from 'react';

interface MaxUsageCardProps extends UsageCardProps {
  maxColor?: Color | AlertVariants;
}

export const MaxUsageCard: FC<MaxUsageCardProps> = ({
  value,
  total,
  unit,
  progressBarColor = 'primary',
  title,
  description,
}) => {
  const ratio = value / total;
  function getColor(): Color | AlertVariants {
    if (ratio > 0.75 && ratio < 1) {
      return 'warning';
    } else if (ratio >= 1) {
      return 'error';
    } else {
      return progressBarColor;
    }
  }

  return (
    <UsageCard
      title={title}
      description={description}
      value={value}
      total={total}
      unit={unit}
      progressBarColor={getColor()}
      minFill={5}
    />
  );
};
