# Custom Kratos container with bundled Takaro configuration
FROM oryd/kratos:v1.2.0

# Switch to root to install packages
USER root

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy configuration files into the container (as root)
COPY containers/kratos/config/kratos.yml /etc/config/kratos/kratos.yml
COPY containers/kratos/config/kratos.yml.template /etc/config/kratos/kratos.yml.template
COPY containers/kratos/config/user.schema.json /etc/config/kratos/user.schema.json

# Copy email templates and mappers
COPY containers/kratos/config/*.jsonnet /etc/config/kratos/

# Create an entrypoint script for environment variable substitution
COPY containers/kratos/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch back to the ory user
USER ory

# Use the entrypoint to handle environment variables
ENTRYPOINT ["/entrypoint.sh"]
CMD ["serve", "-c", "/etc/config/kratos/kratos.yml"]