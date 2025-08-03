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
- `discordId` (optional) - Discord user ID (17-19 digits)

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