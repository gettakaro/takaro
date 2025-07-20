---
inclusion: always
---

# Development Guidelines

## Testing Strategy

- **Integration tests**: Only run when explicitly requested - they have long execution times
- **Verification workflow**: Use linter and build scripts to verify changes instead of integration tests
- **Unit tests**: Can be run individually for targeted testing
  - Example: `npm run test:file packages/app-api/src/service/__tests__/DiscordEmbedDTO.unit.test.ts`

## Code Quality

- Always run linting before submitting changes
- Use build scripts to catch compilation errors early
- Focus on unit test coverage for new functionality
