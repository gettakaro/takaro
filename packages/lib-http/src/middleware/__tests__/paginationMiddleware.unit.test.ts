import { sandbox, expect } from '@takaro/test';
import { NextFunction, Request, Response } from 'express';
import { errors } from '@takaro/util';
import { paginationMiddleware } from '../paginationMiddleware.js';
import { describe, it } from 'vitest';

async function runPagination(page?: number, limit?: number) {
  const req = { query: { page, limit } } as unknown as Request;
  const res = { locals: {} } as Response;
  const next = sandbox.stub<errors.ValidationError[]>();
  await paginationMiddleware(req, res, next as unknown as NextFunction);
  return { req, res, next };
}

describe('pagination middleware', () => {
  it('Handles setting defaults', async () => {
    const { res, next } = await runPagination();
    expect(res.locals.page).to.equal(0);
    expect(res.locals.limit).to.equal(100);
    expect(next).to.have.been.calledOnce;
  });
  it('Works when pagination is passed', async () => {
    const { res, next } = await runPagination(2, 20);
    expect(res.locals.page).to.equal(2);
    expect(res.locals.limit).to.equal(20);
    expect(next).to.have.been.calledOnce;
  });
  it('Handles negative limit', async () => {
    const { next } = await runPagination(1, -1);
    expect(next).to.have.been.calledOnce;
    const callArg = next.getCalls()[0].args[0];
    expect(callArg).to.be.instanceOf(Error);
    expect(callArg.message).to.equal('Invalid pagination: limit must be greater than or equal to 1');
  });
  it('Handles negative page', async () => {
    const { next } = await runPagination(-1, 5);
    expect(next).to.have.been.calledOnce;
    const callArg = next.getCalls()[0].args[0];
    expect(callArg).to.be.instanceOf(Error);
    expect(callArg.message).to.equal('Invalid pagination: page must be greater than or equal to 0');
  });
  it('Handles limit too high', async () => {
    const { next } = await runPagination(1, 1001);
    expect(next).to.have.been.calledOnce;
    const callArg = next.getCalls()[0].args[0];
    expect(callArg).to.be.instanceOf(Error);
    expect(callArg.message).to.equal('Invalid pagination: limit must be less than or equal to 1000');
  });
});
