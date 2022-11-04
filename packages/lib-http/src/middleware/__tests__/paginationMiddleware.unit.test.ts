import { sandbox, expect } from '@takaro/test';
import { NextFunction, Response } from 'express';
import {
  PaginationMiddleware,
  PaginatedRequest,
} from '../paginationMiddleware';
import { errors } from '@takaro/util';

async function runPagination(page?: number, limit?: number) {
  const req = { query: { page, limit } } as unknown as PaginatedRequest;
  const res = {} as Response;
  const next = sandbox.stub<errors.ValidationError[]>();
  const middleware = new PaginationMiddleware();
  await middleware.use(req, res, next as unknown as NextFunction);

  return { req, next };
}

describe('pagination middleware', () => {
  it('Handles setting defaults', async () => {
    const { req, next } = await runPagination();
    expect(req.page).to.equal(0);
    expect(req.limit).to.equal(100);
    expect(next).to.have.been.calledOnce;
  });
  it('Works when pagination is passed', async () => {
    const { req, next } = await runPagination(2, 20);
    expect(req.page).to.equal(2);
    expect(req.limit).to.equal(20);
    expect(next).to.have.been.calledOnce;
  });
  it('Handles negative limit', async () => {
    const { next } = await runPagination(1, -1);
    expect(next).to.have.been.calledOnce;
    const callArg = next.getCalls()[0].args[0];
    expect(callArg).to.be.an.instanceOf(Error);
    expect(callArg.message).to.equal(
      'Invalid pagination: limit must be greater than or equal to 1'
    );
  });
  it('Handles negative page', async () => {
    const { next } = await runPagination(-1, 5);
    expect(next).to.have.been.calledOnce;
    const callArg = next.getCalls()[0].args[0];
    expect(callArg).to.be.an.instanceOf(Error);
    expect(callArg.message).to.equal(
      'Invalid pagination: page must be greater than or equal to 0'
    );
  });
  it('Handles limit too high', async () => {
    const { next } = await runPagination(1, 1001);
    expect(next).to.have.been.calledOnce;
    const callArg = next.getCalls()[0].args[0];
    expect(callArg).to.be.an.instanceOf(Error);
    expect(callArg.message).to.equal(
      'Invalid pagination: limit must be less than or equal to 1000'
    );
  });
});
