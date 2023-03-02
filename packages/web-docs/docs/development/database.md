---
sidebar_position: 3
---

# Database

## Multi-tenancy

Takaro is a multi-tenant application. Each tenant (domain) can only access their own data. This is done by using the `domain` column in the database.

## Database structure

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
    }

    settings {
      string id PK
      string commandPrefix
    }

    gameServerSettings {
      string id PK
      string gameServerId FK
      string commandPrefix
    }

    user {
      string id PK
      string name
      string email
    }

    role {
      string id PK
      string name
    }
    
    player {
      string id PK
      string platformId
      string name
    }

    playerOnGameServer {
      string id PK
      string playerId FK
      string gameServerId FK
      string gameId
    }
    
    function {
      string id PK
      string name
      string code
    }

    functionAssignment {
      string id PK
      string functionId FK
      string cronJob FK
      string hook FK
      string command FK
    }

    hook {
      string id PK
      string name
      string functionId FK
      string searchString
      string regex
      string moduleId FK
    }

    command {
      string id PK
      string name
      string functionId FK
      string moduleId FK
    }

    cron {
      string id PK
      string name
      string temporalValue
      string functionId FK
      string moduleId FK
    }

    module {
      string id PK
      string name
      boolean enabled
    }

    user ||--|{ role : has

    module ||--|{ cron : has
    module ||--|{ hook : has
    module ||--|{ command : has
    hook   ||--|{ functionAssignment : assigned
    command   ||--|{ functionAssignment : assigned
    cron   ||--|{ functionAssignment : assigned
    functionAssignment ||--|| function : is


    playerOnGameServer ||--|| player : is
    playerOnGameServer ||--|| gameServer : is

    settings ||--o{ gameServerSettings : inherits
    gameServer ||--|| gameServerSettings : has
```