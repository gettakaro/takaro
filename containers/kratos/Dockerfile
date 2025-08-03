# Custom Kratos container with bundled Takaro configuration
FROM oryd/kratos:v1.2.0

# Copy configuration files into the container
COPY config/kratos.yml /etc/config/kratos/kratos.yml
COPY config/user.schema.json /etc/config/kratos/user.schema.json

# Copy email templates if they exist
COPY config/*.jsonnet /etc/config/kratos/

# Set the default command to use our config
CMD ["serve", "-c", "/etc/config/kratos/kratos.yml"]