# Getting started

This document will guide you through installing Takaro locally for development. If you are a user of Takaro, you can skip this document and go straight to the [User Guide](/).

The Takaro development environment targets Unix devices (with a focus on Linux)! If you are on Windows, you can use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

## System diagram

![Takaro](../../assets/system-diagram.png)

## Requirements

- Node 18.x
- Npm 8.x
- Docker
- Docker Compose

## Development setup

Run the init script from the root of the repo. This will install all development dependencies, it can take a while...

```bash
./scripts/dev-init.sh

# While this is running, take a look at the generated .env file and adjust as needed
```

Start the development environment:

```bash
docker-compose up --build
```

There is a dashboard available where all the services are listed. You can access it at http://localhost:13337

You will need to create an admin client for the following configuration scripts. Set the `ADMIN_CLIENT_ID` and `ADMIN_CLIENT_SECRET` in your .env file. Give the containers a restart after you've done this.

```bash
docker-compose exec hydra hydra -e http://localhost:4445  create client --grant-type client_credentials --audience t:api:admin --format json
```

Optionally (but recommended!), you can set up some testing data automatically.

```bash
# Generate data for the standard development setup
docker-compose exec takaro node scripts/dev-data.mjs
```
