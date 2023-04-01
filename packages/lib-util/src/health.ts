import { logger } from './logger.js';

class Health {
  private log = logger('health');

  private hooks = new Map<string, CallableFunction>();

  public registerHook(name: string, hook: CallableFunction) {
    this.hooks.set(name, hook);
  }

  public unregisterHook(name: string) {
    this.hooks.delete(name);
  }

  public async check() {
    try {
      this.log.debug(`Evaluating ${this.hooks.size} health hooks`);
      const results = await Promise.all(
        Array.from(this.hooks.values()).map((hook) => hook())
      );

      return results.every((result) => result);
    } catch (error) {
      this.log.error(error);
      return false;
    }
  }
}

export const health = new Health();
