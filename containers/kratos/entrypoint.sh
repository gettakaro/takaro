#!/bin/sh
set -e

# Create a working directory that the ory user can write to
WORK_DIR="/tmp/kratos-config"
mkdir -p "$WORK_DIR"

# Copy the config file to the working directory
cp /etc/config/kratos/kratos.yml "$WORK_DIR/kratos.yml"

# Check if template exists and we have environment variables set
if [ -f "/etc/config/kratos/kratos.yml.template" ] && [ -n "$KRATOS_PUBLIC_URL" ]; then
    echo "Using templated configuration..."
    # Export all KRATOS_, DISCORD_, and STEAM_ variables for envsubst
    export $(env | grep -E '^(KRATOS_|DISCORD_|STEAM_)' | cut -d= -f1)
    # Use envsubst to replace all environment variables
    envsubst < /etc/config/kratos/kratos.yml.template > "$WORK_DIR/kratos.yml"
else
    echo "Using default development configuration..."
    # For development, still support Discord OAuth configuration via environment
    if [ -n "$DISCORD_CLIENT_ID" ] && [ -n "$DISCORD_CLIENT_SECRET" ]; then
        echo "Configuring Discord OAuth provider for development..."
        # Use sed to update the Discord configuration in the working copy
        # Ensure values are quoted as strings in YAML
        sed -i "s/client_id: .*/client_id: \"$DISCORD_CLIENT_ID\"/" "$WORK_DIR/kratos.yml"
        sed -i "s/client_secret: .*/client_secret: \"$DISCORD_CLIENT_SECRET\"/" "$WORK_DIR/kratos.yml"
    fi
    # For development, also support Steam OAuth configuration via environment
    if [ -n "$STEAM_CLIENT_ID" ] && [ -n "$STEAM_CLIENT_SECRET" ] && [ -n "$STEAM_AUTH_PROXY_URL" ]; then
        echo "Configuring Steam OAuth provider for development..."
        # Update Steam provider configuration
        # Note: auth_url uses localhost for browser access, while token_url and issuer_url use internal Docker URL
        sed -i '/- id: steam/,/- openid/ {
            s|client_id: .*|client_id: "'"$STEAM_CLIENT_ID"'"|
            s|client_secret: .*|client_secret: "'"$STEAM_CLIENT_SECRET"'"|
            s|issuer_url: .*|issuer_url: "'"$STEAM_AUTH_PROXY_URL"'"|
            s|auth_url: .*|auth_url: "'"$STEAM_AUTH_PROXY_URL"'/authorize"|
            s|token_url: .*|token_url: "'"$STEAM_AUTH_PROXY_URL"'/token"|
        }' "$WORK_DIR/kratos.yml"
    fi
fi

# Execute the original kratos command with the modified config
exec kratos "$@" -c "$WORK_DIR/kratos.yml"