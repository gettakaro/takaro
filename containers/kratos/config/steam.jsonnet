// Steam OAuth2 mapper for Ory Kratos
// This mapper supports both account linking and registration.
// For registration, it sets authProvider to "steam" without requiring email.
// Steam ID is stored as a trait for efficient searching.

local claims = std.extVar('claims');

{
  identity: {
    traits: {
      // Set authProvider for Steam registrations
      authProvider: "steam",
      // Set name from Steam username if available
      name: if 'name' in claims then claims.name else null,
      // Store Steam ID from the subject claim for searchability
      steamId: claims.sub,
      // No email required for Steam registration
      // Email can be added later in user settings
    },
  },
}