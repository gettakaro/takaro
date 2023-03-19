export type Elevation = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: add link to docs
export const elevationLight: Record<Elevation, string> = {
  0: '0 1px 4px -1px hsla(214, 45%, 20%, 0.52)',
  1: '0 2px 4px -1px hsla(214, 53%, 23%, 0.16), 0 3px 12px -1px hsla(214, 50%, 22%, 0.26)',
  2: '0 2px 6px -1px hsla(214, 53%, 23%, 0.16), 0 8px 24px -4px hsla(214, 47%, 21%, 0.38)',
  3: '0 3px 18px -2px hsla(214, 53%, 23%, 0.16), 0 12px 48px -6px hsla(214, 47%, 21%, 0.38)',
  4: '0 4px 24px -3px hsla(214, 53%, 23%, 0.16), 0 18px 64px -8px hsla(214, 47%, 21%, 0.38)',
  5: '0 5px 32px -4px hsla(214, 53%, 23%, 0.16), 0 24px 70px -12px hsla(214, 47%, 21%, 0.38)',
};

export const elevationDark: Record<Elevation, string> = {
  0: '0 1px 4px -1px hsla(0, 0%, 0%, 0.52)',
  1: '0 2px 4px -1px hsla(0, 0%, 0%, 0.16), 0 3px 12px -1px hsla(0, 0%, 0%, 0.26)',
  2: '0 2px 6px -1px hsla(0, 0%, 0%, 0.16), 0 8px 24px -4px hsla(0, 0%, 0%, 0.38)',
  3: '0 3px 18px -2px hsla(0, 0%, 0%, 0.16), 0 12px 48px -6px hsla(0, 0%, 0%, 0.38)',
  4: '0 4px 24px -3px hsla(0, 0%, 0%, 0.16), 0 18px 64px -8px hsla(0, 0%, 0%, 0.38)',
  5: '0 5px 32px -4px hsla(0, 0%, 0%, 0.16), 0 24px 70px -12px hsla(0, 0%, 0%, 0.38)',
};
