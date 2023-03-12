import { AsyncLocalStorage } from 'node:async_hooks';
import { errors, logger } from './main.js';

const log = logger('ctx');

interface TransactionStore {
  [key: string]: string | undefined;
  domain?: string;
  gameServer?: string;
}

function isValidTransactionStore(store: unknown): store is TransactionStore {
  return (
    typeof store === 'object' &&
    store !== null &&
    Object.values(store).every((val) => typeof val === 'string')
  );
}

class Context {
  private asyncLocalStorage = new AsyncLocalStorage();

  addData(data: TransactionStore) {
    const store = this.asyncLocalStorage.getStore();

    if (!isValidTransactionStore(store)) {
      log.warn(
        'Tried to add data to ctx, but store was not initialized correctly. Are you inside an async context?'
      );
      throw new errors.InternalServerError();
    }

    this.asyncLocalStorage.enterWith({ ...store, ...data });
  }

  get data(): TransactionStore {
    const store = this.asyncLocalStorage.getStore();

    if (!isValidTransactionStore(store)) {
      log.warn(
        'Requested data from ctx, but store was not initialized correctly. Are you inside an async context?'
      );
      throw new errors.InternalServerError();
    }

    return store;
  }

  wrap(fn: any, metadata: TransactionStore = {}) {
    return (...args: any[]) => {
      return this.asyncLocalStorage.run(
        metadata,
        fn,
        ...args
      ) as Promise<unknown>;
    };
  }
}

export const ctx = new Context();
