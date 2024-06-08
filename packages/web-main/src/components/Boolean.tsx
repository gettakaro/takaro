import { Chip, ChipProps } from '@takaro/lib-components';
import { FC } from 'react';

type LikeBoolean = boolean | 'true' | 'false' | 'yes' | 'no';

interface BooleanProps {
  value: LikeBoolean;
  truePositive?: boolean;
}

export const Boolean: FC<BooleanProps> = ({ value, truePositive = true }) => {
  let color: ChipProps['color'] = 'backgroundAccent';

  if (value === true || value === 'true' || value === 'yes') {
    color = truePositive ? 'success' : 'error';
  } else if (value === false || value === 'false' || value === 'no') {
    color = truePositive ? 'error' : 'success';
  }

  if (typeof value === 'boolean') {
    value = value ? 'true' : 'false';
  }

  return <Chip variant="outline" color={color} label={value as string} />;
};
