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
    # Export all KRATOS_ and DISCORD_ variables for envsubst
    export $(env | grep -E '^(KRATOS_|DISCORD_)' | cut -d= -f1)
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
fi

# Execute the original kratos command with the modified config
exec kratos "$@" -c "$WORK_DIR/kratos.yml"