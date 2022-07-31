# @takaro/config

An opinionated config manager based on [node-convict](https://github.com/mozilla/node-convict)

## Usage

```ts
import { Config, IBaseConfig } from '@takaro/config';

interface IExampleConfig extends IBaseConfig {
  test: string;
}

// This is a schema from convict
const exampleSchema = {
  test: {
    doc: 'Test value',
    format: String,
    default: 'test',
    env: 'TAKARO_TEST'
  }
};

const config = new Config<IExampleConfig>([exampleSchema]);

// ---

config.load({ test: 1 });
// Error! 'test' should be a string
config.validate();

// ---

config.load({ test: 'Hello world' });
config.get('test') // 'Hello world'
```