import { AsyncLocalStorage } from 'async_hooks';
import { errors } from './main';
import { Span, trace, Tracer } from '@opentelemetry/api';

interface TransactionStore {
  domain?: string;
  gameServer?: string;
  jobId?: string;
  user?: string;
  vmId?: number;
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

  wrapContext(fn: any, metadata: TransactionStore = {}) {
    return (...args: any[]) => {
      return this.asyncLocalStorage.run(
        metadata,
        fn,
        ...args
      ) as Promise<unknown>;
    };
  }

  private setContextAttributes(obj: TransactionStore, span: Span) {
    Object.entries(obj).forEach(([key, value]) => {
      span.setAttribute(key, value);
    });
  }

  /**
   * Wraps a function with opentelemetry tracing AND custom context tracking
   * @param name Name of the span
   * @param fn Abitrary function
   * @returns A wrapped function that will start a span and end it when the function is done
   */
  wrap(name: string, fn: any) {
    const ctxWrapped = this.wrapContext(fn);
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        const tracer: Tracer = trace.getTracer('takaro-generic-tracer');
        tracer.startActiveSpan(name, (span: Span) => {
          this.setContextAttributes(this.data, span);
          ctxWrapped(...args)
            .then((res) => {
              span.end();
              resolve(res);
            })
            .catch((err) => {
              span.end();
              reject(err);
            });
        });
      });
    };
  }
}

export const ctx = new Context();
