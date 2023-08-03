# API

For a hands-on experience and quick start with the Takaro API, please visit the [interactive API documentation](https://api.stg.takaro.dev/api.html). This page allows you to explore the API's endpoints, make test requests, and view responses in real-time. It's a great resource for both learning and debugging.

## Authentication

If you are logged in to the Takaro dashboard, you can automatically use the endpoints on the [interactive API documentation](https://api.stg.takaro.dev/api.html). 

If you dont have login credentials, ask your server administrator to create these.

## Querying Data

Takaro API provides powerful querying capabilities through its various POST /search endpoints. You can use these endpoints to retrieve data based on specific criteria. The querying features include filters for exact matches, searches for partial matches, and pagination for handling large data sets.

### Filters

Filters allow you to specify exact match criteria for the data you are querying. When you use filters, the API will return only the records that exactly match the specified criteria.

```json
{
  "filters": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

In the above example, the API will return records where the name is exactly "John Doe" and the email is exactly "john.doe@example.com".

### Searches

Searches, on the other hand, allow for partial matches. This is useful when you are looking for records that contain a specific substring.

```json
{
  "search": {
    "name": "John"
  }
}
```

In the above example, the API will return all records where the name contains the substring "John".

### Pagination

When querying large data sets, it's often useful to retrieve the data in smaller chunks or pages. You can use the page and limit parameters to achieve this.

```json
{
  "page": 2,
  "limit": 10
}
```

In the above example, the API will return the second page of results, with a limit of 10 records per page.

### Putting it all together

You can combine filters, searches, and pagination in a single query. Here is an example that combines all three:

```json

{
  "filters": {
    "email": "john@example.com"
  },
  "search": {
    "name": "John"
  },
  "page": 1,
  "limit": 5
}
```

This query will return the first page of records where the email field exactly matches "example.com", and the name field contains the substring "John", with a maximum of 5 records in the response.


## Error Codes and Handling

The Takaro API returns error information within the response data. In case an error occurs, you should inspect the `meta.error` property in the response data for details about the error.

If there is an error in the API response, it might look like this:

```json
{
  "meta": {
    "error": {
      "code": "ValidationError",
      "details": {// ...}
    } 
  },
  "data": null
}
```

In this example, the meta.error property will contain a description of the error.


## SDKs and Libraries

> ⚠️ **Coming soon**
> The package already exists but is not yet published on npm.


To interact with the Takaro API programmatically, you can use the `@takaro/apiclient` library. This is included in the Takaro monorepo and can simplify making API requests and handling responses.

To use the `@takaro/apiclient` library, you need to install it via npm:

```sh
npm install @takaro/apiclient
```

Then, you can import it into your project and use it to make API requests:

```javascript
import { Client } from '@takaro/apiclient';

const client = new Client({
  url: 'https://api.stg.takaro.dev',
  auth: {
    username: 'username',
    password: 'password,
  }
});
```

## Technical Reference

Takaro uses [Ory Kratos](https://www.ory.sh/kratos/) for identity management. For some backend machine-to-machine authorization, it uses [Ory Hydra](https://www.ory.sh/hydra/) which implements the OpenID Connect protocol.

Takaro is a multi-tenant application. Each tenant (domain) has its own isolated set of data. Some API routes are domain-scoped while others (think of domain management routes) use admin authentication.

### Admin authentication

Since admin authentication is used mostly for automation, it uses OpenID Connect using the client credentials flow. After installing the auth services, you can create a client using the Ory Hydra CLI (or the admin API).

```sh
hydra -e http://localhost:4445  create client --grant-type client_credentials --audience t:api:admin --format json
```

This will return a client ID and secret, note these down and **keep them secret**. You can now use these credentials to get an access token. The `lib-apiclient` library automatically handles this. (See [lib-apiclient](../../packages/lib-apiclient/README.md))

You can create a domain with the following command:

```sh
curl -X POST localhost:13000/domain -H "Content-Type: application/json" -u admin:${ADMIN_SECRET} --data '{"name": "test-domain"}' | jq
```