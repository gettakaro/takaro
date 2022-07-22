# Takaro

## Development quick-start

```sh
# Copy the default config
cp .env.example .env
# Start all containers; database, cache, hasura, ...
docker-compose -f docker-compose-dev.yml up -d
npm ci

# You're all set! Go crazy :)
```