#!/bin/sh

mkdir -p _data

# The prometheus container runs as a user with UID and GID 65534
# so we need to make sure the data directory is writable by that user
if [ ! -d "./_data/prometheus" ]; then
  mkdir -p ./_data/prometheus
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 65534:65534 ./_data/prometheus
  fi
fi

# Same for Grafana
if [ ! -d "./_data/grafana" ]; then
  mkdir -p ./_data/grafana
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 472:472 ./_data/grafana
  fi
fi

# Same for Postgres
if [ ! -d "./_data/db" ]; then
  mkdir -p ./_data/db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 999:0 ./_data/db
  fi
fi

# Same for Hydra
if [ ! -d "./_data/hydra-db" ]; then
  mkdir -p ./_data/hydra-db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 999:0 ./_data/hydra-db
  fi
fi

# Same for Kratos
if [ ! -d "./_data/kratos-db" ]; then
  mkdir -p ./_data/kratos-db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 999:0 ./_data/kratos-db
  fi
fi

ls -la _data
