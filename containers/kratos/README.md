# Takaro Kratos Container

This is a custom Kratos container that bundles Takaro's identity configuration.

## Why Custom Container?

Previously, we had two separate Kratos configurations:
- Dev environment: Configuration files in `/containers/ory/kratos/`
- Production (Helm): Configuration embedded in `values.yaml`

This led to configuration drift and manual synchronization issues. By bundling the configuration in a custom container, we ensure consistency across all environments.

## Configuration Files

- `config/kratos.yml` - Main Kratos configuration
- `config/user.schema.json` - Identity schema defining user traits
- `config/*.jsonnet` - Email templates

## Identity Schema

The identity schema includes the following traits:
- `email` (required) - User's email address
- `stripeId` (optional) - Stripe customer ID
- `steamId` (optional) - Steam ID (17 digits)

## Configuration

The Kratos container supports both development and production configurations:

- **Development**: Uses the static `kratos.yml` configuration with hardcoded localhost URLs
- **Production**: Uses `kratos.yml.template` with environment variable substitution when `KRATOS_PUBLIC_URL` is set

### Environment Variables for Production

#### Required Core Variables
- `KRATOS_PUBLIC_URL`: Public-facing URL for Kratos (e.g., `https://auth.example.com`)
- `KRATOS_ADMIN_URL`: Admin API URL (e.g., `http://kratos:4434/`)
- `KRATOS_BROWSER_RETURN_URL`: Default return URL after auth flows (e.g., `https://app.example.com/login`)
- `KRATOS_UI_LOGIN_URL`: Login page URL (e.g., `https://app.example.com/login`)

#### Optional Variables (with development defaults)
- `KRATOS_CORS_ALLOWED_ORIGINS`: JSON array of allowed CORS origins (default: `["http://127.0.0.1:13001","http://127.0.0.1:13002"]`)
- `KRATOS_ALLOWED_RETURN_URLS`: JSON array of allowed return URLs (default: development URLs)
- `KRATOS_UI_ERROR_URL`: Error page URL
- `KRATOS_UI_SETTINGS_URL`: Settings page URL
- `KRATOS_UI_RECOVERY_URL`: Account recovery page URL
- `KRATOS_UI_VERIFICATION_URL`: Email verification page URL
- `KRATOS_UI_DASHBOARD_URL`: Post-verification dashboard URL
- `KRATOS_UI_LOGOUT_RETURN_URL`: Post-logout return URL
- `KRATOS_UI_REGISTRATION_URL`: Registration page URL (if enabled)

#### Email Configuration
- `KRATOS_COURIER_SMTP_CONNECTION_URI`: SMTP connection string (default: `smtp://mailhog:1025/?disable_starttls=true`)
- `KRATOS_COURIER_FROM_ADDRESS`: Sender email address (default: `noreply@takaro.io`)
- `KRATOS_COURIER_FROM_NAME`: Sender name (default: `Takaro`)

## Discord OAuth Integration

The container includes Discord as a social sign-in provider. Discord IDs are stored in OIDC credentials within Kratos and synced to Takaro's database for application use.

### Discord Configuration

Set the following environment variables:
- `DISCORD_CLIENT_ID` - Your Discord OAuth application's client ID
- `DISCORD_CLIENT_SECRET` - Your Discord OAuth application's client secret

### How Discord OAuth Works

1. User connects Discord through Ory OAuth flow
2. Discord ID is stored in OIDC credentials (format: `discord:123456789`)
3. Takaro extracts the ID from OIDC credentials and syncs to its database
4. Discord role synchronization uses the ID from Takaro's database

## Building

The image is automatically built as part of the docker-compose setup:

```bash
docker-compose build kratos
```

For production, the image should be built and pushed to the container registry:

```bash
docker build -t ghcr.io/gettakaro/takaro-kratos:latest .
docker push ghcr.io/gettakaro/takaro-kratos:latest
```

## Usage

The container works exactly like the official Kratos container but with our configuration bundled:

```bash
# Run migrations
docker run takaro-kratos:latest migrate sql -e --yes

# Run server
docker run takaro-kratos:latest serve --dev
```