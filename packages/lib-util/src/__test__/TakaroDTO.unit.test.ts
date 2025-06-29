import { TakaroDTO } from '../TakaroDTO.js';
import { IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { expect } from '@takaro/test';
import { describe, it } from 'vitest';

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

class NestedDTO extends TakaroDTO<NestedDTO> {
  @ValidateNested()
  @Type(() => TestDTO)
  one: TestDTO;

  @ValidateNested({ each: true })
  @Type(() => TestDTO)
  two: TestDTO[];
}

describe('TakaroDTO', () => {
  it('Happy path, creates a data class', async () => {
    const test = new TestDTO({
      foo: 'foo',
      bar: 11,
      secretPassword: 'takaro_ftw!!',
    });
    const json = test.toJSON();
    expect(json.foo).to.equal('foo');
    expect(json.bar).to.equal(11);
  });
  it('Can validate without async construct', async () => {
    await expect(
      // @ts-expect-error - we are testing invalid data, TS accurately says it's not right but we need to test runtime as well
      new TestDTO({ foo: ['a', 'b'], bar: 2 }).validate(),
    ).to.eventually.be.rejectedWith('property foo has failed the following constraints: isString');
  });

  it('throws an error when passing invalid data', async () => {
    await expect(
      // @ts-expect-error - we are testing invalid data, TS accurately says it's not right but we need to test runtime as well
      new TestDTO({ foo: ['a', 'b'], bar: 2 }).validate(),
    ).to.eventually.be.rejectedWith('property foo has failed the following constraints: isString');
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

  it('Can construct nested DTOs', () => {
    const nested = new NestedDTO({
      one: {
        foo: 'foo',
        bar: 11,
        secretPassword: 'takaro_ftw!!',
      },
      two: [
        {
          foo: 'foo',
          bar: 11,
          secretPassword: 'aaa',
        },
        { foo: 'foo', bar: 11, secretPassword: 'bbb' },
      ],
    });

    const json = nested.toJSON();
    expect(json.one.foo).to.equal('foo');
    expect(json.two[0].foo).to.equal('foo');
  });

  it('Can validate nested DTOs', async () => {
    const nested = new NestedDTO({
      one: {
        foo: 'foo',
        bar: 11,
        secretPassword: 'takaro_ftw!!',
      },
      two: [
        {
          // @ts-expect-error - we are testing invalid data, TS accurately says it's not right but we need to test runtime as well
          foo: ['a', 'b'],
          bar: 11,
          secretPassword: 'aaa',
        },
        { foo: 'foo', bar: 11, secretPassword: 'bbb' },
      ],
    });

    await expect(nested.validate()).to.eventually.be.rejectedWith(
      'property two[0].foo has failed the following constraints: isString',
    );
  });

  it('Can override properties after construction', () => {
    const test = new TestDTO({
      foo: 'foo',
      bar: 11,
      secretPassword: 'takaro_ftw!!',
    });
    expect(test.foo).to.equal('foo');

    test.foo = 'bar';

    expect(test.foo).to.equal('bar');
  });

  it('Can use spread operator to override properties', () => {
    const test = new TestDTO({
      foo: 'foo',
      bar: 11,
      secretPassword: 'takaro_ftw!!',
    });

    expect(test.foo).to.equal('foo');

    const test2 = new TestDTO({ ...test, foo: 'bar' });

    expect(test2.foo).to.equal('bar');
  });
});
