---
sidebar_position: 2
hide_table_of_contents: true
---

# Resetting data

<p>
    <strong>Warning:</strong> This will delete all data from the database. This includes all domains, users, and their
    related data. This is not reversible. DO NOT run this in production.
</p>

There are two ways to reset database data, each applicable in different situations. If your environment is running correctly, you can quickly delete all domains (with related data) using the `dev-remove-domains.mjs` script. This script will talk to the Takaro API, thus if your application is not running this will fail. This script is significantly faster than the other option.

```bash
docker compose exec takaro node scripts/dev-remove-domains.mjs
```

If your setup is well and truly messed up, you can use the `dev-reset-data.sh` script. This will take down the containers, remove the database data on file system level and then restart the containers.

```bash
./scripts/dev-reset-data.sh
```

## "Starting from scratch"

Cleaning out all artifacts from the repo and rebuilding everything. This will take a while, so go grab some ☕️.

```bash
npm run clean && ./scripts/dev-init.sh && docker compose up -d --build
```
