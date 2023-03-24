import { Transition } from 'framer-motion';

export function getTransition(): Transition {
  return {
    type: 'linear',
    duration: 0.125,
  };
}
