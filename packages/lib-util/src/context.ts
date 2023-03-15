import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { errors } from './main.js';

interface TransactionStore {
  domain?: string;
  gameServer?: string;
  user?: string;
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
      throw new errors.InternalServerError();
    }

    this.asyncLocalStorage.enterWith({ ...store, ...data });
  }

  get data(): TransactionStore {
    const store = this.asyncLocalStorage.getStore();

    if (!isValidTransactionStore(store)) {
      return {};
    }

    return store;
  }

  wrap(fn: any, metadata: TransactionStore = {}) {
    return (...args: any[]) => {
      const txId = randomUUID();
      return this.asyncLocalStorage.run(
        { txId, ...metadata },
        fn,
        ...args
      ) as Promise<unknown>;
    };
  }
}

export const ctx = new Context();
