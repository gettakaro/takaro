---
sidebar_position: 5
---

# Self hosting

Takaro is designed to be a cloud-first, highly available, and scalable platform. We recommend using our hosted
solution to ensure the best experience for you and your players. This self hosting guide is provided as a reference
for advanced users who wish to run Takaro on their own infrastructure.

This guide will set up a basic Takaro instance on a single server. This guide assumes you have a basic understanding of
Docker and general server administration. We make a lot of assumptions about the
environment in which Takaro is running, you will need to adapt this guide to your specific environment.

For simplicity, we will not cover certain aspects of running a production service in this guide, such as reverse proxy, backups, monitoring, security hardening, scaling, etc.

## Prerequisites

- A server running Ubuntu 24.04
  - Other Linux distributions may work, but this guide is written for and tested on Ubuntu 24.04
- Docker and Docker Compose installed
- A domain name pointing to your server
  - You will need 2 A records, one to the top level domain (takaro.example.com) and one to the wildcard domain (\*.takaro.example.com)
- Basic unix command line utilities like git, vim, and curl will be useful

## Installation

Clone the Takaro repository to your server:

```bash
git clone https://github.com/gettakaro/takaro.git
```

The compose file will store a bunch of persistent data. Different containers need different permissions on these folders

```bash
./scripts/setup-data-folders.sh
```

There is a reference Docker compose file at `deploy/compose/docker-compose.yml`.
Take a look at this file to see what we'll be deploying.

```bash
cd deploy/compose
cat docker-compose.yml
```

Go back to the root of the repo and copy the example .env file from the repo and edit it as needed

```bash
cp .env.example .env
```

Now we can start the services with Docker Compose:

```bash
docker compose -f deploy/compose/docker-compose.yml up -d
```

You should be able to access the Takaro web interface at `https://takaro.your-domain.com`.

## Troubleshooting

If you encounter any issues, you should always check the logs of the services you are running. You can do this with the following command:

```bash
docker compose -f deploy/compose/docker-compose.yml logs -f
```

If you know the error is with a specific service, you can filter the logs to only show that service:

```bash
docker compose -f deploy/compose/docker-compose.yml logs -f <service-name>
docker compose -f deploy/compose/docker-compose.yml logs -f api
```

You can also use grep to filter the logs:

```bash
docker compose -f deploy/compose/docker-compose.yml logs -f | grep error
docker compose -f deploy/compose/docker-compose.yml logs -f | grep 123-some-id-456

```
