// credits: https://codesandbox.io/s/framer-motion-keyframes-ekks8?fontsize=14&module=/src/Example.tsx&file=/src/Example.tsx:136-445

import { FC } from 'react';
import { styled } from '../../../styled';
import { Color, Size, AlertVariants } from '../../../styled/types';
import { motion } from 'framer-motion';

const Container = styled(motion.div)<{
  color: Color | AlertVariants | 'white' | 'background';
  size: Size;
}>`
  width: 15px;
  height: 15px;
  background-color: ${({ theme, color }) => theme.colors[color]};

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          width: 4px;
          height: 4px;
        `;
      case 'small':
        return `
          width: 6px;
          height: 6px;
        `;
      case 'medium':
        return `
          width: 8px;
          height: 8px;
        `;
      case 'large':
        return `
          width: 13px;
          height: 13px;
        `;
      case 'huge':
        return `
          width: 20px;
          height: 20px;
        `;
    }
  }}
`;

export interface SpinnerProps {
  size: Size;
  color?: Color | AlertVariants | 'white' | 'background';
}

export const Spinner: FC<SpinnerProps> = ({ size, color = 'white' }) => (
  <Container
    animate={{
      scale: [1, 2, 2, 1, 1],
      rotate: [0, 0, 270, 270, 0],
      borderRadius: ['20%', '20%', '50%', '50%', '20%']
    }}
    color={color}
    size={size}
    transition={{
      duration: 1.5,
      ease: 'easeInOut',
      times: [0, 0.2, 0.5, 0.8, 1],
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0
    }}
  />
);
