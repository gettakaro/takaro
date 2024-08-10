/* this is an attempt to make a z-index system that is easy to use and understand using stacking order
 It is important to have a good understanding of HTML's stacking context
 Recommended: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context
*/

type ComponentType = 'tooltip' | 'dialog' | 'drawer' | 'dropdown' | 'overlay' | 'notificationBanner' | 'errorMessage';

// IMPORTANT: types, in order of their desired z-index
// Overlay is the backdrop for drawer and dialog
const types: ComponentType[] = [
  'tooltip',
  'dialog',
  'drawer',
  'notificationBanner',
  'overlay',
  'dropdown',
  'errorMessage',
];

// This is a magic value that is loosely based on our websites.
// courtesy of some 3rd party components
const baseValue = 10000;

// maps z-index to each type
export const zIndex = types.reduce(
  (acc: Record<ComponentType, number>, type, index) => {
    acc[type] = baseValue + index;
    return acc;
  },
  {} as Record<ComponentType, number>, // initialize obj with correct type
);
