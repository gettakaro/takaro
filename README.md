# Takaro

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

Optionally (but recommended!), you can set up some testing data automatically.

```bash
# Take a look at the .env file and adjust as needed
./scripts/dev-data.sh
```

### Working on app-agent

app-agent needs to execute nerdctl to talk to containerd. I haven't been able to get this properly setup in the docker-compose file.. :(


```
# install https://github.com/containerd/nerdctl

# Install rootless
sudo apt install uidmap
containerd-rootless-setuptool.sh install
```

## Repo setup

This repo is a monorepo, using [NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

There are two types of packages; libraries (`lib-*`) and applications (`app-*`).

### Libraries

- Can be imported by other packages.
- Do not have a `start` script.
- Do have a `start:dev` script, typically, this runs the Typescript compiler in watch mode.

### Applications

- Can NOT be imported by other packages.
- Does have a `start` script, which runs the application in production mode.
- Does have a `start:dev` script, which runs the application with auto-reloading functionality.

## Database

```mermaid
erDiagram
    domain {
      string id PK
      string name
    }
    
    gameServer {
      string id PK
      string name
      enum type
      json connectionInfo 
      string domainId FK
    }

    user {
      string id PK
      string name
      string email
      string domainId FK
    }

    role {
      string id PK
      string name
      string domainId FK
    }
    
    player {
      string id PK
      string platformId
      string name
      string gameServerId FK
    }

    
    function {
      string id PK
      string name
      string domainId FK
      string code
    }

    hook {
      string id PK
      string name
      string functionId FK
      string searchString
      string regex
    }

    command {
      string id PK
      string name
      string functionId FK
    }

    cron {
      string id PK
      string name
      string temporalValue
      string functionId FK
    }

    domain ||--|{ gameServer : contains
    domain ||--|{ user : contains
    domain ||--|{ role : contains
    user ||--|{ role : has
    domain ||--|{ hook : contains
    domain ||--|{ command : contains
    domain ||--|{ cron : contains
    hook   ||--|| function : calls
    command   ||--|| function : calls
    cron   ||--|| function : calls
    gameServer ||--|{ player : "plays in"
```