import { Transition } from 'framer-motion';

export function getTransition(): Transition {
  return {
    type: 'spring',
    bounce: 0.35,
    duration: 0.3,
  };
}
