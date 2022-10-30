import { TakaroDTO } from '../TakaroDTO';
import { expect } from '@takaro/test';
import { IsNumber, IsString, Max, Min } from 'class-validator';
import { Exclude } from 'class-transformer';

class TestDTO extends TakaroDTO<TestDTO> {
  @IsString()
  foo: string;

  @IsNumber()
  @Max(20)
  @Min(10)
  bar: number;

  @Exclude()
  @IsString()
  secretPassword: string;
}

describe('TakaroDTO', () => {
  it('Happy path, creates a data class', async () => {
    const test = new TestDTO({
      foo: 'foo',
      bar: 11,
      secretPassword: 'takaro_ftw!!',
    });
    await test.validate();
    const json = test.toJSON();
    expect(json.foo).to.equal('foo');
    expect(json.bar).to.equal(11);
  });

  it('throws an error when passing invalid data', async () => {
    expect(
      // @ts-expect-error - we are testing invalid data, TS accurately says it's not right but we need to test runtime as well
      new TestDTO({ foo: ['a', 'b'], bar: 2 }).validate()
    ).to.eventually.throw(
      'property foo has failed the following constraints: isString'
    );
  });

  it('Does not allow extra properties', async () => {
    expect(
      // @ts-expect-error - we are testing invalid data, TS accurately says it's not right but we need to test runtime as well
      new TestDTO({ foo: 'foo', bar: 11, baz: 'baz' }).validate()
    ).to.eventually.throw(
      'property baz has failed the following constraints: whitelistValidation'
    );
  });

  it('.toJSON omits properties marked with exclude', async () => {
    const test = new TestDTO({
      foo: 'foo',
      bar: 11,
      secretPassword: 'takaro_ftw!!',
    });
    const json = test.toJSON();
    expect(json.secretPassword).to.be.undefined;
  });
});
