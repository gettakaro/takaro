class Health {
  private hooks = new Map<string, CallableFunction>();

  public registerHook(name: string, hook: CallableFunction) {
    this.hooks.set(name, hook);
  }

  public unregisterHook(name: string) {
    this.hooks.delete(name);
  }

  public async check() {
    try {
      const results = await Promise.all(Array.from(this.hooks.values()).map((hook) => hook()));

      return results.every((result) => result);
    } catch (_error) {
      return false;
    }
  }
}

export const health = new Health();
