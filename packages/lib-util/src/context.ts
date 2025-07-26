import { AsyncLocalStorage } from 'async_hooks';
import { errors } from './main.js';
import { Span, trace, Tracer } from '@opentelemetry/api';
import { Knex } from 'knex';

interface TransactionStore {
  domain?: string;
  gameServer?: string;
  jobId?: string;
  user?: string;
  module?: string;
  transaction?: Knex.Transaction;
}

function isValidTransactionStore(store: unknown): store is TransactionStore {
  return (
    typeof store === 'object' &&
    store !== null &&
    Object.entries(store).every(([key, val]) => {
      if (key === 'transaction') {
        return val === undefined || val === null || (typeof val === 'object' && val !== null);
      }
      return typeof val === 'string' || val === undefined || val === null;
    })
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

  wrapContext(fn: any, metadata: TransactionStore = {}) {
    return (...args: any[]) => {
      return this.asyncLocalStorage.run(metadata, fn, ...args);
    };
  }

  async runInTransaction<T>(knex: Knex, callback: () => Promise<T>): Promise<T> {
    // If already in a transaction, use it
    if (this.data.transaction) {
      return callback();
    }

    // Start new transaction and store in context
    return knex.transaction(async (trx) => {
      this.addData({ transaction: trx });
      try {
        const result = await callback();
        return result;
      } finally {
        // Clean up transaction from context
        const { transaction: _transaction, ...rest } = this.data;
        this.asyncLocalStorage.enterWith(rest);
      }
    });
  }

  get transaction(): Knex.Transaction | undefined {
    return this.data.transaction;
  }

  hasTransaction(): boolean {
    return !!this.data.transaction;
  }

  private setContextAttributes(obj: TransactionStore, span: Span) {
    Object.entries(obj).forEach(([key, value]) => {
      if (key !== 'transaction' && value !== undefined && value !== null) {
        span.setAttribute(key, String(value));
      }
    });
  }

  /**
   * Wraps a function with opentelemetry tracing AND custom context tracking
   * @param name Name of the span
   * @param fn Arbitrary function
   * @returns A wrapped function that will start a span and end it when the function is done
   */
  wrap(name: string, fn: any) {
    const ctxWrapped = this.wrapContext(fn, ctx.data);

    if (process.env.TRACING_ENABLED !== 'true') return ctxWrapped;

    return (...args: any[]) => {
      const tracer: Tracer = trace.getTracer('takaro-generic-tracer');

      return tracer.startActiveSpan(name, (span: Span) => {
        this.setContextAttributes(this.data, span);
        try {
          const result = ctxWrapped(...args);
          if (result instanceof Promise && result.then) {
            return result
              .then((res) => {
                span.end();
                return res;
              })
              .catch((err) => {
                span.end();
                throw err;
              });
          }
          span.end();
          return result;
        } catch (err) {
          span.end();
          throw err;
        }
      });
    };
  }
}

export const ctx = new Context();

export function traceableClass(name: string) {
  return function traceableClass<T extends { new (...args: any[]): object }>(OriginalConstructor: T) {
    return class extends OriginalConstructor {
      constructor(...args: any[]) {
        super(...args);
        for (const key of Object.getOwnPropertyNames(OriginalConstructor.prototype)) {
          const typedKey = key as keyof typeof this;

          if (key !== 'constructor' && typeof this[typedKey] === 'function') {
            const originalMethod = this[typedKey];
            if (typeof originalMethod === 'function') {
              this[typedKey] = ctx.wrap(`${name}:${key}`, (...args: any[]) => {
                return originalMethod.bind(this)(...args);
              }) as (typeof this)[typeof typedKey];
            }
          }
        }
      }
    };
  };
}
