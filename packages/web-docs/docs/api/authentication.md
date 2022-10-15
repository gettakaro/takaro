# Authentication

Takaro is a multi-tenant application. Each tenant (domain) has its own isolated set of data.

Some API routes are domain-scoped while others (think of domain management routes) use admin authentication.

## Admin authentication

Admin authentication uses basic authentication. The username is `admin` and the password is defined by the env var `ADMIN_SECRET`.

```sh
curl -X POST localhost:13000/domain -H "Content-Type: application/json" -u admin:${ADMIN_SECRET} --data '{"name": "test-domain"}' | jq
```

## Domain-scoped authentication

First, a domain must be created using admin authentication. When creating a domain, the API will automatically create a domain-root account and return its credentials.

```sh
curl -X POST localhost:13000/domain -H "Content-Type: application/json" -u admin:${ADMIN_SECRET} --data '{"name": "test-domain"}' | jq
```

Domain-scoped authentication uses bearer authentication. To retrieve a token, you must first login with a valid user account, we can use the root account from the previous step.

```sh
curl -X POST localhost:13000/login -H "Content-Type: application/json" --data '{"username": "root@test-domain", "password": "${PASSWORD}"}' | jq
```

We can now start using the api! For example, requesting a list of users

```sh
curl localhost:13000/user -H "Content-Type: application/json"  -H "Authorization: Bearer ${TOKEN}" | jq
```