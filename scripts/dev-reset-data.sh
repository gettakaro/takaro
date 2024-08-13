#!/bin/bash

set -e

# Show a prompt, asking the user if they are sure

read -p "This will delete all data in the database. Are you sure? (y/n) " -n 1 -r

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborting."
  exit 1
fi

# Delete all data in the database

echo "Deleting data..."

docker compose down

sudo rm -rf ./_data/db
sudo rm -rf ./_data/kratos-db

docker compose up -d

echo "Data deleted! You can recreate data via the dev-data script"
