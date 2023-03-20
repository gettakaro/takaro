# Authentication

Takaro uses [Ory Kratos](https://www.ory.sh/kratos/) for identity management. For some backend machine-to-machine authorization, it uses [Ory Hydra](https://www.ory.sh/hydra/) which implements the OpenID Connect protocol.

Takaro is a multi-tenant application. Each tenant (domain) has its own isolated set of data. Some API routes are domain-scoped while others (think of domain management routes) use admin authentication.


## Admin authentication

Since admin authentication is used mostly for automation, it uses OpenID Connect using the client credentials flow. After installing the auth services, you can create a client using the Ory Hydra CLI (or the admin API).

```sh
hydra -e http://localhost:4445  create client --grant-type client_credentials --audience t:api:admin --format json
```

This will return a client ID and secret, note these down. You can now use these credentials to get an access token. The `lib-apiclient` library automatically handles this. (See [lib-apiclient](../../packages/lib-apiclient/README.md))

## Domain-scoped authentication

First, a domain must be created using admin authentication. When creating a domain, the API will automatically create a domain-root account and return its credentials.

```sh
curl -X POST localhost:13000/domain -H "Content-Type: application/json" -u admin:${ADMIN_SECRET} --data '{"name": "test-domain"}' | jq
```

You can now use these credentials on the main dashboard. Visit /api.html of the service you want to interact with to see the API documentation.