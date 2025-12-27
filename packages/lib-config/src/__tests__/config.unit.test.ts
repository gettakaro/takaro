import { expect } from '@takaro/test';
import { describe, it } from 'node:test';

import { Config, IBaseConfig } from '../main.js';

interface ITestConfig extends IBaseConfig {
  test: string;
}

const testConfigSchema = {
  test: {
    doc: 'Test value',
    format: String,
    default: 'test',
  },
};

describe('config', () => {
  it('Allows loading one config', () => {
    const config = new Config<ITestConfig>();
    expect(config.get('app.name')).to.equal('UNNAMED_PACKAGE');
  });
  it('Throws an error when validating', () => {
    const config = new Config<ITestConfig>([testConfigSchema]);
    // @ts-expect-error Testing something the compiler could catch...
    config.load({ test: 1 });
    expect(() => config.validate()).to.throw('test: must be of type String: value was 1');
  });
  it('Allows loading multiple configs', () => {
    const config = new Config<ITestConfig>([testConfigSchema]);
    expect(config.get('test')).to.equal('test');
  });
});
