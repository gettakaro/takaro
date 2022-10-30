import { logger } from '@takaro/util';

export class DomainScoped {
  protected log;
  constructor(public readonly domainId: string) {
    this.log = logger(this.constructor['name']);
  }
}
