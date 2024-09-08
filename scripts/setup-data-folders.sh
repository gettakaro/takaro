#!/bin/sh

mkdir -p _data

echo "---------------------------------------------------------------------------------------------------"
echo "Setting up data folders..."
echo "Data will be stored in the _data folder"
echo "The script will ask for sudo permissions to change the ownership of the data folders"
echo "---------------------------------------------------------------------------------------------------"

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
fi

# The postgres container seems to reset the ownership of the data directory
# So we cannot just rely on 'does it exist already'
if command -v sudo >/dev/null 2>&1; then
  sudo chown -R 999:0 ./_data/db
fi

# Same for Kratos
if [ ! -d "./_data/kratos-db" ]; then
  mkdir -p ./_data/kratos-db
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R 999:0 ./_data/kratos-db
  fi
fi

if command -v sudo >/dev/null 2>&1; then
  sudo chmod -R 777 ./_data
fi

echo "---------------------------------------------------------------------------------------------------"
ls -la _data
echo "---------------------------------------------------------------------------------------------------"
echo "Data folders setup complete"
echo "---------------------------------------------------------------------------------------------------"
