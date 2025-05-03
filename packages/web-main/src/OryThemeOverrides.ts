import { darkTheme } from '@takaro/lib-components';

export const oryThemeOverrides: Partial<unknown> = {
  fontFamily: 'Inter, sans-serif',
  accent: {
    def: darkTheme.colors.primary,
    muted: darkTheme.colors.primary,
    emphasis: darkTheme.colors.primary,
    disabled: darkTheme.colors.disabled,
    subtle: darkTheme.colors.backgroundAccent,
  },
  foreground: {
    def: darkTheme.colors.text,
    muted: darkTheme.colors.textAlt,
    subtle: darkTheme.colors.text,
    disabled: darkTheme.colors.disabled,
    onDark: darkTheme.colors.textAlt,
    onAccent: darkTheme.colors.text,
    onDisabled: darkTheme.colors.disabled,
  },
  background: {
    surface: darkTheme.colors.background,
    canvas: darkTheme.colors.backgroundAlt,
    subtle: darkTheme.colors.background,
  },
  error: {
    def: darkTheme.colors.error,
    subtle: darkTheme.colors.error,
    muted: darkTheme.colors.error,
    emphasis: darkTheme.colors.error,
  },
  success: {
    emphasis: darkTheme.colors.primary,
  },
  border: {
    def: darkTheme.colors.backgroundAccent,
  },
  text: {
    def: darkTheme.colors.text,
    disabled: darkTheme.colors.disabled,
  },
  input: {
    background: darkTheme.colors.placeholder,
    disabled: darkTheme.colors.disabled,
    placeholder: darkTheme.colors.placeholder,
    text: darkTheme.colors.text,
  },
};
