# @takaro/apiclient

Automatically generated API client for Takaro. 

## Usage

```ts
import { AdminClient, Client } from '@takaro/apiclient';

const url = 'http://localhost:13000';

const adminClient = new AdminClient({
  url,
  auth: {
    clientId: config.get('hydra.adminClientId'),
    clientSecret: config.get('hydra.adminClientSecret'),
  },
  OAuth2URL: config.get('hydra.publicUrl'),
});

const createdDomain = await this.adminClient.domain.domainControllerCreate({
  name: 'test-domain',
});

const client = new Client({
  url,
  auth: {
    username: createdDomain.data.data.rootUser.email,
    password: createdDomain.data.data.password
  },
});

await client.login();

```