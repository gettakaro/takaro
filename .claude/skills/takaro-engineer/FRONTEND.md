# Frontend Development

## lib-components

UI component library at `packages/lib-components/`.

### Structure

```
src/
├── components/       # UI components by category
│   ├── actions/     # Button, Dropdown, IconButton
│   ├── inputs/      # TextField, Select, Checkbox
│   ├── feedback/    # Loading, alerts
│   └── ...
├── styled/          # Theme and styled-components utilities
├── hooks/           # Custom React hooks
└── test/            # Test utilities
```

### Commands

```bash
# Start Storybook (port 13002)
npm run start:dev --workspace=packages/lib-components

# Run tests
npm run test:unit --workspace=packages/lib-components

# Update snapshots
npm run test:snapshot --workspace=packages/lib-components
```

### Component Pattern

```typescript
// Controlled (form-integrated)
export { ControlledTextField as TextField } from './TextField';

// Uncontrolled (standalone)
export { GenericTextField as UnControlledTextField } from './TextField/Generic';
```

Use controlled exports for forms, uncontrolled for standalone usage.

### Styled Components

Custom `styled` export with theme typing:

```typescript
import { styled } from '../../../styled';

export const Input = styled.input<{ hasError: boolean }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.backgroundAccent};
`;
```

### Theming

Two themes: `lightTheme`, `darkTheme`

```typescript
import { useThemeSwitcher } from '@takaro/lib-components';

const { toggleTheme, currentTheme } = useThemeSwitcher();
```

Persisted to localStorage under `theme` key.

## web-main

Main frontend app at `packages/web-main/`.

### Structure

```
src/
├── App.tsx           # Main app with providers
├── router.tsx        # TanStack Router config
├── routeTree.gen.ts  # Auto-generated routes
├── routes/           # File-based routing
│   ├── __root.tsx
│   ├── _auth/        # Authenticated routes
│   └── login.tsx
├── components/       # App-specific components
├── hooks/            # App-specific hooks
└── queries/          # React Query definitions
```

### Commands

```bash
# Start dev server (port 13001)
npm run start:dev --workspace=packages/web-main

# Build
npm run build --workspace=packages/web-main

# Tests
npm run test:unit --workspace=packages/web-main
npm run test:snapshot --workspace=packages/web-main
```

### Routing

Uses TanStack Router with file-based routing.
- Routes in `src/routes/`
- `routeTree.gen.ts` is auto-generated - don't edit

### Dev Credentials

```
Username: ${TAKARO_DEV_USER_NAME}@${TAKARO_DEV_DOMAIN_NAME}
Password: ${TAKARO_DEV_USER_PASSWORD}
```

Default: `takaro@localdev.local` / `takaro_is_cool`

## Storybook

Config at `/.storybook/` (repo root).

```bash
# Start (port 13002)
npm run start:dev --workspace=packages/lib-components
```

Stories from:
- `packages/lib-components/src/**/*.stories.tsx`
- `packages/web-main/src/**/*.stories.tsx`

## Testing

### Test Setup

Use custom render from `/src/test/testUtils.tsx`:

```typescript
import { render } from '../test/testUtils';

render(<MyComponent />);
```

Wraps with: ThemeProvider, SnackbarProvider, RouterProvider

### Snapshot Testing

```bash
# See failures
npm run test:unit --workspace=packages/lib-components

# Update
npm run test:snapshot --workspace=packages/lib-components
```

## Gotchas

1. **Always use lib-components**: Never create inline components in web-main
2. **Route tree is generated**: Don't edit `routeTree.gen.ts`
3. **Controlled vs Uncontrolled**: Use default exports for forms
4. **Test wrapper required**: Use custom `render` from testUtils
5. **Storybook config at root**: Config is at `/.storybook/`, not in lib-components
