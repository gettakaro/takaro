import { FC } from 'react';
import { Margin } from './util';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { useTheme } from '../../hooks';

interface PointHighlightProps {
  margin: Margin;
  yMax: number;
  tooltipLeft: number;
  tooltipTop: number;
}

export const PointHighlight: FC<PointHighlightProps> = ({ margin, yMax, tooltipLeft, tooltipTop }) => {
  const theme = useTheme();

  return (
    <Group left={margin.left} top={margin.top}>
      <Line
        from={{ x: tooltipLeft, y: 0 }}
        to={{ x: tooltipLeft, y: yMax }}
        stroke={theme.colors.backgroundAccent}
        strokeWidth={1}
        pointerEvents="none"
        strokeDasharray="4,1"
      />
      <circle
        cx={tooltipLeft}
        cy={tooltipTop}
        r={4}
        fill="black"
        fillOpacity={0.1}
        stroke="black"
        strokeOpacity={0.1}
        strokeWidth={2}
        pointerEvents="none"
      />
      <circle
        cx={tooltipLeft}
        cy={tooltipTop}
        r={4}
        fill={theme.colors.backgroundAccent}
        stroke="white"
        strokeWidth={2}
        pointerEvents="none"
      />
    </Group>
  );
};
