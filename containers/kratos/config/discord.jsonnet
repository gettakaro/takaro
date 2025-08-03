// Discord OAuth2 mapper for Ory Kratos
// This mapper returns empty traits to prevent overwriting existing user data
// during account linking. Discord ID is extracted from OIDC credentials.
// 
// IMPORTANT: This mapper is designed for account linking only.
// If you need Discord login/registration, update this mapper to map email.

local claims = std.extVar('claims');

{
  identity: {
    traits: {
      // Return empty traits - don't update any existing user data
      // This prevents email conflicts when users link Discord accounts
      // that use different email addresses
    },
  },
}